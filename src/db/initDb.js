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

const sampleProducts = [
  // ================= ELECTRONICS =================
  [
    "iPhone 15 Pro",
    79999,
    "electronics",
    "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Samsung Galaxy S24",
    69999,
    "electronics",
    "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "MacBook Air M2",
    114999,
    "electronics",
    "https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Sony WH-1000XM5 Headphones",
    24999,
    "electronics",
    "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    'iPad Pro 12.9"',
    89999,
    "electronics",
    "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    'Dell 27" 4K Monitor',
    34999,
    "electronics",
    "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Canon EOS R50 Camera",
    54999,
    "electronics",
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Apple Watch Series 9",
    36999,
    "electronics",
    "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Keychron K2 Mechanical Keyboard",
    7999,
    "electronics",
    "https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Sony PlayStation 5",
    49999,
    "electronics",
    "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Amazon Echo Dot 5th Gen",
    3999,
    "electronics",
    "https://images.pexels.com/photos/4790255/pexels-photo-4790255.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "DJI Mini 4 Pro Drone",
    74999,
    "electronics",
    "https://images.pexels.com/photos/1034812/pexels-photo-1034812.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "JBL Charge 5 Bluetooth Speaker",
    9999,
    "electronics",
    "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Kindle Paperwhite",
    9999,
    "electronics",
    "https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],

  // ================= FASHION =================
  [
    "Nike Air Max 270 Sneakers",
    8999,
    "fashion",
    "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Levi's 501 Original Jeans",
    3999,
    "fashion",
    "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Men's Leather Jacket",
    6999,
    "fashion",
    "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Ray-Ban Aviator Sunglasses",
    4999,
    "fashion",
    "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Leather Tote Handbag",
    3499,
    "fashion",
    "https://images.pexels.com/photos/1204459/pexels-photo-1204459.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Adidas Ultraboost 23",
    9999,
    "fashion",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Men's Chino Trousers",
    2499,
    "fashion",
    "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Canvas Backpack 30L",
    2199,
    "fashion",
    "https://images.pexels.com/photos/1546003/pexels-photo-1546003.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Men's Formal Derby Shoes",
    4999,
    "fashion",
    "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Women's Ankle Boots",
    5499,
    "fashion",
    "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Slim Fit Blazer",
    5999,
    "fashion",
    "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],

  // ================= BOOKS =================
  [
    "Atomic Habits – James Clear",
    499,
    "books",
    "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "The Psychology of Money",
    449,
    "books",
    "https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Sapiens – Yuval Noah Harari",
    549,
    "books",
    "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Deep Work – Cal Newport",
    399,
    "books",
    "https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "The Alchemist – Paulo Coelho",
    299,
    "books",
    "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Think and Grow Rich",
    349,
    "books",
    "https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "1984 – George Orwell",
    249,
    "books",
    "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "The 48 Laws of Power",
    549,
    "books",
    "https://images.pexels.com/photos/762687/pexels-photo-762687.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Thinking, Fast and Slow",
    499,
    "books",
    "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "The Art of War – Sun Tzu",
    199,
    "books",
    "https://images.pexels.com/photos/2465877/pexels-photo-2465877.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],

  // ================= HOME =================
  [
    "Dyson V15 Vacuum Cleaner",
    34999,
    "home",
    "https://images.pexels.com/photos/4107278/pexels-photo-4107278.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Nespresso Vertuo Coffee Maker",
    12999,
    "home",
    "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Himalayan Salt Lamp",
    1499,
    "home",
    "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Weighted Blanket 15 lbs",
    3999,
    "home",
    "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "LED Desk Lamp with USB",
    1999,
    "home",
    "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Wooden Photo Frame Set",
    899,
    "home",
    "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Wall Clock – Minimalist",
    1299,
    "home",
    "https://images.pexels.com/photos/280264/pexels-photo-280264.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Scented Soy Candle Set",
    1199,
    "home",
    "https://images.pexels.com/photos/278823/pexels-photo-278823.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],

  // ================= SPORTS =================
  [
    "Wilson Tennis Racket Pro",
    4999,
    "sports",
    "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Mountain Bike 21-Speed",
    24999,
    "sports",
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Football – Nike Strike",
    1999,
    "sports",
    "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Treadmill Foldable Electric",
    39999,
    "sports",
    "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Badminton Racket Set",
    1499,
    "sports",
    "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Cricket Bat – English Willow",
    4999,
    "sports",
    "https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg?auto=compress&w=400&h=400&fit=crop",
  ],
  [
    "Basketball – Spalding",
    2499,
    "sports",
    "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&w=400&h=400&fit=crop",
  ]
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
