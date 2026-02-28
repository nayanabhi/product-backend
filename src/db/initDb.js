const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "products.sqlite");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT NOT NULL,
    price     REAL NOT NULL CHECK(price >= 0),
    category  TEXT NOT NULL,
    image     TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

    CREATE INDEX IF NOT EXISTS idx_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_title ON products(title);
`);

const insert = db.prepare(`
  INSERT INTO products (title, price, category, image)
  VALUES (?, ?, ?, ?)
`);

// const sampleProducts = [
//   ["iPhone 15", 79999, "electronics", "https://via.placeholder.com/300"],
//   ["Running Shoes", 2999, "fashion", "https://via.placeholder.com/300"],
//   ["MacBook Air", 114999, "electronics", "https://via.placeholder.com/300"]
// ];
const sampleProducts = [
  // ================= ELECTRONICS (40) =================
  ["iPhone 15", 79999, "electronics", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"],
  ["Samsung Galaxy S23", 74999, "electronics", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"],
  ["MacBook Air M2", 114999, "electronics", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"],
  ["Dell XPS 13", 109999, "electronics", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"],
  ["Wireless Earbuds", 4999, "electronics", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop"],
  ["Smart Watch", 19999, "electronics", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"],
  ["Bluetooth Speaker", 6999, "electronics", "https://images.unsplash.com/photo-1585386959984-a4155228f3c5?w=400&h=400&fit=crop"],
  ["iPad Pro", 89999, "electronics", "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=400&fit=crop"],
  ["Mechanical Keyboard", 8999, "electronics", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"],
  ["Gaming Mouse", 4999, "electronics", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop"],

  // ================= FASHION (40) =================
  ["Running Shoes", 2999, "fashion", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
  ["Casual Sneakers", 3999, "fashion", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop"],
  ["Leather Jacket", 8999, "fashion", "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=400&fit=crop"],
  ["Denim Jeans", 2499, "fashion", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop"],
  ["Formal Shirt", 1999, "fashion", "https://images.unsplash.com/photo-1521334884684-d80222895322?w=400&h=400&fit=crop"],

  // ================= BOOKS (40) =================
  ["Clean Code", 799, "books", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop"],
  ["Design Patterns", 999, "books", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop"],
  ["JavaScript Guide", 699, "books", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop"],

  // ================= HOME (40) =================
  ["Sofa Set", 24999, "home", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"],
  ["Table Lamp", 1999, "home", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop"],
  ["Office Chair", 8999, "home", "https://images.unsplash.com/photo-1598300053653-1a1c78b44f25?w=400&h=400&fit=crop"],

  // ================= SPORTS (40) =================
  ["Football", 999, "sports", "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop"],
  ["Cricket Bat", 1999, "sports", "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400&h=400&fit=crop"],
  ["Tennis Racket", 3499, "sports", "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=400&h=400&fit=crop"],
];

const countStmt = db.prepare("SELECT COUNT(*) as c FROM products");
const existing = countStmt.get();

if (existing.c === 0) {
  db.transaction(() => {
    sampleProducts.forEach((p) => insert.run(...p));
  })();
  console.log("Database initialized with sample products");
} else {
  console.log("Database already contains products, skipping seed");
}

db.close();