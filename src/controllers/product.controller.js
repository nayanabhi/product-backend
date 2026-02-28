const { getProducts } = require("../services/product.service");
const logger = require("../utils/logger");

function fetchProducts(req, res, next) {
  try {
    const result = getProducts(req.query);
    res.status(200).json(result);
  } catch (err) {
    logger.error("Failed to fetch products", { error: err.message });
    next(err);
  }
}

module.exports = { fetchProducts };