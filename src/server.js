const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
});

server.on("error", (err) => {
  logger.error("Server error", { message: err.message });
  process.exit(1);
});