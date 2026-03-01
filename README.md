# Product API — Technical Documentation

**Version:** 1.0.0  
**Stack:** Node.js, Express 5, SQLite (file-based)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements Compliance](#2-requirements-compliance)
3. [Optimizations](#3-optimizations)
4. [Additional Functionality](#4-additional-functionality)
5. [API Reference](#5-api-reference)
6. [Configuration](#6-configuration)
7. [Production Readiness](#7-production-readiness)
8. [Future Scope](#8-future-scope)

---

## 1. Overview

This document describes the Product API backend: implementation, requirements compliance, and production considerations. Each requirement and optimization is backed by **supporting evidence** (file paths and code references).

---

## 2. Requirements Compliance

### 2.1 Backend API Framework

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Backend API using a framework (Node.js, Java, etc.) | Met | Node.js with Express 5.x |

**Supporting evidence:**

- **File:** `package.json` — dependencies include `express`, runtime `node`.
- **File:** `src/app.js` (lines 1–10, 24) — Express app creation and route mounting.
- **File:** `src/server.js` — HTTP server listening on `PORT`.

```javascript
// src/app.js (excerpt)
const express = require("express");
const app = express();
// ...
app.use("/api/products", productRoutes);
```

---

### 2.2 File-Based Database

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File-based database for data storage | Met | SQLite via `better-sqlite3` |

**Supporting evidence:**

- **File:** `src/db/db.js` (lines 1–8) — SQLite connection to a file path.
- **File:** `src/db/initDb.js` (lines 5–10) — Creates `data/` and `data/products.sqlite`.

```javascript
// src/db/db.js
const dbPath = path.join(__dirname, "../../data/products.sqlite");
const db = new Database(dbPath, { readonly: true });
```

Database file: `data/products.sqlite` (under project root).

---

### 2.3 Product Database Schema

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Product database with title, price, category, image | Met | Schema in init script |

**Supporting evidence:**

- **File:** `src/db/initDb.js` (lines 13–21) — table definition.

```sql
-- src/db/initDb.js
CREATE TABLE IF NOT EXISTS products (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT NOT NULL,
  price     REAL NOT NULL CHECK(price >= 0),
  category  TEXT NOT NULL,
  image     TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| title | TEXT | NOT NULL |
| price | REAL | NOT NULL, ≥ 0 |
| category | TEXT | NOT NULL |
| image | TEXT | optional |

---

### 2.4 API Endpoint to Fetch Products

| Requirement | Status | Evidence |
|-------------|--------|----------|
| API endpoint to fetch products | Met | `GET /api/products` |

**Supporting evidence:**

- **File:** `src/routes/product.routes.js` (line 7) — route and middleware.
- **File:** `src/controllers/product.controller.js` (lines 4–11) — handler calls service and returns JSON.
- **File:** `src/services/product.service.js` (lines 10–65) — `getProducts()` builds query and returns `{ data, meta }`.

```javascript
// src/routes/product.routes.js
router.get("/", validateQuery, fetchProducts);

// src/controllers/product.controller.js
const result = getProducts(req.query);
res.status(200).json(result);
```

---

### 2.5 Search, Category Filter, and Pagination

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Search | Met | `?search=<term>` (prefix-only, case-insensitive) |
| Category filter | Met | `?category=<value>` |
| Pagination | Met | `?page=<n>&limit=<n>` (limit 1–50) |

**Supporting evidence:**

- **File:** `src/services/product.service.js` (lines 15–25, 31–39) — WHERE clauses and pagination.

```javascript
// src/services/product.service.js — search (prefix-only for index use)
if (search) {
  where.push("LOWER(title) LIKE @search ESCAPE '\\'");
  params.search = `${escapeLike(search.toLowerCase())}%`;
}
if (category) {
  where.push("category = @category");
  params.category = category;
}
// ...
ORDER BY id
LIMIT @limit OFFSET @offset
```

| Param | Description | Example |
|-------|-------------|---------|
| search | Case-insensitive title **prefix** search | `?search=shoe` |
| category | Exact category filter | `?category=electronics` |
| page | Page number (default 1) | `?page=2` |
| limit | Items per page 1–50 (default 12) | `?limit=20` |

---

### 2.6 Basic Validation and Security

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Basic validation | Met | Query validation (page, limit, length caps) |
| Security checks | Met | Helmet, CORS, rate limiting, body limit, LIKE escaping |

**Supporting evidence:**

- **File:** `src/middleware/validateQuery.js` (lines 3–4, 11–24) — pagination and length limits.

```javascript
// src/middleware/validateQuery.js
const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;
// ...
let search = toStr(req.query.search).trim().toLowerCase().slice(0, MAX_SEARCH_LENGTH);
let category = toStr(req.query.category).trim().toLowerCase().slice(0, MAX_CATEGORY_LENGTH);
if (page < 1 || !Number.isInteger(page)) {
  return res.status(400).json({ error: "Invalid pagination", message: "page must be a positive integer" });
}
if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
  return res.status(400).json({ error: "Invalid pagination", message: "limit must be between 1 and 50" });
}
```

- **File:** `src/app.js` (lines 13–21) — security middleware.

```javascript
// src/app.js
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? ... : "*", optionsSuccessStatus: 200 }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimiter);
```

- **File:** `src/middleware/rateLimiter.js` (lines 4–12) — rate limit (default 100 req/min, configurable).

```javascript
// src/middleware/rateLimiter.js
rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => { /* 429 + message */ },
});
```

- **File:** `src/services/product.service.js` (lines 5–8) — LIKE special-character escaping to avoid pattern abuse.

```javascript
// src/services/product.service.js
function escapeLike(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[%_\\]/g, "\\$&");
}
```

---

## 3. Optimizations

### 3.1 Caching

| Optimization | Status | Evidence |
|--------------|--------|----------|
| In-memory cache for product list and categories | Met | NodeCache with TTL |

**Supporting evidence:**

- **File:** `src/utils/cache.js` (lines 1–5) — cache instance.

```javascript
// src/utils/cache.js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });
```

- **File:** `src/services/product.service.js` (lines 12–13, 63–64) — product cache key and set.

```javascript
// src/services/product.service.js
const cacheKey = `products:${search}:${category}:${page}:${limit}`;
if (cache.has(cacheKey)) return cache.get(cacheKey);
// ... query ...
cache.set(cacheKey, response);
```

- **File:** `src/services/product.service.js` (lines 68–69, 79–80) — categories cache (longer TTL).

```javascript
const cacheKey = "categories:all";
if (cache.has(cacheKey)) return cache.get(cacheKey);
// ...
cache.set(cacheKey, categories, 300);
```

| Cache | Key pattern | TTL |
|-------|-------------|-----|
| Products | `products:{search}:{category}:{page}:{limit}` | 60 s |
| Categories | `categories:all` | 300 s |

---

### 3.2 Indexing

| Optimization | Status | Evidence |
|--------------|--------|----------|
| Indexes to support category filter and prefix title search | Met | Three indexes in init script |

**Supporting evidence:**

- **File:** `src/db/initDb.js` (lines 23–25) — index definitions.

```sql
-- src/db/initDb.js
CREATE INDEX IF NOT EXISTS idx_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_title ON products(LOWER(title));
CREATE INDEX IF NOT EXISTS idx_category_title ON products(category, LOWER(title));
```

| Index | Purpose |
|-------|---------|
| `idx_category` | `WHERE category = ?` |
| `idx_title` | Prefix search on `LOWER(title)` (no leading `%`) |
| `idx_category_title` | Combined `category` + prefix on `LOWER(title)` |

Title search uses **prefix-only** `LIKE 'term%'` so SQLite can use `idx_title` / `idx_category_title`; a leading wildcard would prevent index use.

---

### 3.3 Single-Query Fetch (Products + Total Count)

| Optimization | Status | Evidence |
|--------------|--------|----------|
| One DB round-trip for list and total count | Met | Window function in SELECT |

**Supporting evidence:**

- **File:** `src/services/product.service.js` (lines 31–45, 47–49) — single prepared statement returns rows and total.

```javascript
// src/services/product.service.js
const stmt = db.prepare(`
  SELECT
    id, title, price, category, image, created_at,
    COUNT(*) OVER() AS total_count
  FROM products
  ${whereClause}
  ORDER BY id
  LIMIT @limit OFFSET @offset
`);
const rows = stmt.all({ ...params, limit, offset: (page - 1) * limit });
const total = rows[0]?.total_count ?? 0;
const data = rows.map(({ total_count, ...rest }) => rest);
```

No separate `COUNT(*)` query; one call returns both `data` and `meta.total`.

---

## 4. Additional Functionality

| Feature | Description | Evidence |
|---------|-------------|----------|
| Centralized logging | Winston; console in dev, file transports in prod | `src/utils/logger.js` (transports, level from `LOG_LEVEL` / NODE_ENV) |
| Request logging | Method, path, status, duration, IP | `src/middleware/requestLogger.js` |
| Error handling | Global error and 404 handlers; no stack in prod | `src/middleware/errorHandler.js` |
| Health endpoint | Liveness/readiness | `src/app.js` — `GET /health` → `{ status: "OK" }` |
| Read-only DB | Runtime uses read-only SQLite connection | `src/db/db.js` — `readonly: true` |
| Idempotent init | Seed only when table is empty | `src/db/initDb.js` — `SELECT COUNT(*)` then conditional insert |
| Categories endpoint | List categories with counts | `src/routes/product.routes.js` — `GET /categories`; `src/services/product.service.js` — `getCategories()` |
| Method not allowed | 405 for non-GET on list | `src/routes/product.routes.js` — `router.all("/", ...)` |

---

## 5. API Reference

### GET /api/products

Returns products with optional search, category filter, and pagination.

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 12 | Items per page (1–50) |
| search | string | No | — | Title prefix search (case-insensitive) |
| category | string | No | — | Filter by category |

**Example**

```bash
curl "http://localhost:5000/api/products?page=1&limit=5"
curl "http://localhost:5000/api/products?search=shoe&category=fashion"
```

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "title": "iPhone 15 Pro",
      "price": 79999,
      "category": "electronics",
      "image": "https://...",
      "created_at": "2026-02-28 06:08:57",
      "updated_at": "2026-02-28 06:08:57"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 200,
    "totalPages": 17
  }
}
```

### GET /api/products/categories

Returns distinct categories and product counts.

**Evidence:** `src/services/product.service.js` — `getCategories()` (GROUP BY category, COUNT).

**Response**

```json
[
  { "category": "books", "count": 10 },
  { "category": "electronics", "count": 14 }
]
```

### GET /health

Health check. **Evidence:** `src/app.js` — `app.get("/health", ...)`.

```json
{ "status": "OK" }
```

---

## 6. Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | `production` enables file logging |
| CORS_ORIGIN | * | Allowed origins (comma-separated in prod) |
| RATE_LIMIT_MAX | 100 | Max requests per minute per client |
| LOG_LEVEL | info (prod) / debug | Winston log level |

---

## 7. Production Readiness

- **Security:** Helmet, CORS, rate limiting, JSON body limit (10kb), and LIKE escaping are applied as shown in [§2.6](#26-basic-validation-and-security).
- **Stability:** Single-query product fetch ([§3.3](#33-single-query-fetch-products--total-count)), stable `ORDER BY id` pagination, and read-only DB connection reduce inconsistency and accidental writes.
- **Observability:** Health endpoint for load balancers; request logging and centralized Winston logger; file logs in production (`logs/error.log`, `logs/combined.log`) when `NODE_ENV=production` — **evidence:** `src/utils/logger.js`.
- **Deployment:** Run `npm run init-db` once to create and seed `data/products.sqlite`; then start with `npm start`. Set `NODE_ENV=production`, restrict `CORS_ORIGIN` to frontend origin(s), and ensure the process has read access to `data/` and write access to `logs/` (for file logging).
- **Validation:** Invalid `page`/`limit` return 400 with a clear message; search and category are length-capped and normalized — **evidence:** `src/middleware/validateQuery.js`.

---

## 8. Future Scope

1. **Segregate categories into a separate table**  
   Move category from a repeated string on `products` to a `categories` table (e.g. `id`, `slug`, `name`, `sort_order`) and reference it via `products.category_id`. This reduces redundancy, avoids typos/variants (e.g. "Electronics" vs "electronics"), and allows category-level metadata (description, image, visibility) and easier admin UIs. The current `GET /api/products/categories` would then query the `categories` table (with optional product count via JOIN or cache).

2. **Distributed cache and API versioning**  
   For multi-instance deployments, replace or front in-memory NodeCache with a shared store (e.g. Redis) so all instances share the same product/category cache. Optionally introduce API versioning (e.g. `/api/v1/products`) to allow backward-compatible changes to response shape or query parameters without breaking existing clients.

---

*All code references above point to the current codebase; line numbers are approximate and may shift with edits.*
