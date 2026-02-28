const logger = require("../utils/logger");

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;

function toStr(val) {
  if (val == null) return "";
  return Array.isArray(val) ? String(val[0]) : String(val);
}

module.exports = function validateQuery(req, res, next) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 12;
  let search = toStr(req.query.search).trim().toLowerCase().slice(0, MAX_SEARCH_LENGTH);
  let category = toStr(req.query.category).trim().toLowerCase().slice(0, MAX_CATEGORY_LENGTH);

  if (page < 1 || !Number.isInteger(page)) {
    logger.warn("Invalid page param", { page: req.query.page });
    return res.status(400).json({ error: "Invalid pagination", message: "page must be a positive integer" });
  }
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    logger.warn("Invalid limit param", { limit: req.query.limit });
    return res.status(400).json({ error: "Invalid pagination", message: "limit must be between 1 and 50" });
  }

  req.query = { page, limit, search, category };
  next();
};