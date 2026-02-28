const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

module.exports = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", { ip: req.ip, path: req.path });
    res.status(429).json({ error: "Too Many Requests", message: "Rate limit exceeded. Try again later." });
  },
});