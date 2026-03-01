const express = require("express");
const { fetchProducts, fetchCategories } = require("../controllers/product.controller");
const validateQuery = require("../middleware/validateQuery");

const router = express.Router();

router.get("/", validateQuery, fetchProducts);
router.get("/categories", fetchCategories);

router.all("/", (_, res) => {
  res.status(405).json({ message: "Method Not Allowed" });
});

module.exports = router;