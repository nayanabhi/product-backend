const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const productRoutes = require("./routes/product.routes");
const rateLimiter = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const logger = require("./utils/logger");

const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : "*",
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(rateLimiter);

app.use("/api/products", productRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

app.use(notFoundHandler);
app.use(errorHandler);

logger.info("Application middleware configured");

module.exports = app;