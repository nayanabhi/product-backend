const db = require("../db/db");
const cache = require("../utils/cache");
const logger = require("../utils/logger");

function escapeLike(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[%_\\]/g, "\\$&");
}

function getProducts({ search, category, page = 1, limit = 12 }) {
  logger.debug("Fetching products", { search, category, page, limit });
  const cacheKey = `products:${search}:${category}:${page}:${limit}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let where = [];
  let params = {};

  if (category) {
    where.push("category = @category");
    params.category = category;
  }

  if (search) {
    where.push("LOWER(title) LIKE @search ESCAPE '\\'");
    params.search = `${escapeLike(search.toLowerCase())}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";



  const stmt = db.prepare(`
    SELECT
      id, title, price, category, image, created_at,
      COUNT(*) OVER() AS total_count
    FROM products
    ${whereClause}
    ORDER BY id
    LIMIT @limit OFFSET @offset
  `);

  const rows = stmt.all({
    ...params,
    limit:  limit,
    offset: (page - 1) * limit,
  });

  const total = rows[0]?.total_count ?? 0;

  const data = rows.map(({ total_count, ...rest }) => rest);

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const response = {
    data,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };

  cache.set(cacheKey, response);
  return response;
}

function getCategories() {
  const cacheKey = "categories:all";
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const stmt = db.prepare(`
    SELECT
      category,
      COUNT(*) AS count
    FROM products
    GROUP BY category
    ORDER BY category ASC
  `);

  const categories = stmt.all();
  cache.set(cacheKey, categories, 300);
  return categories;
}

module.exports = { getProducts, getCategories };