const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/products.sqlite");

const db = new Database(dbPath, {
  readonly: true
});

module.exports = db;