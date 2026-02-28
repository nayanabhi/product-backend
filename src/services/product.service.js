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

  const totalStmt = db.prepare(`
    SELECT COUNT(*) as count FROM products ${whereClause}
  `);

  const total = totalStmt.get(params).count;

  const stmt = db.prepare(`
    SELECT * FROM products
    ${whereClause}
    LIMIT @limit OFFSET @offset
  `);

  const data = stmt.all({
    ...params,
    limit,
    offset: (page - 1) * limit
  });

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

module.exports = { getProducts };