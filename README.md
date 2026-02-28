# Product API — Technical Documentation

**Version:** 1.0.0  
**Stack:** Node.js, Express, SQLite (file-based)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements Compliance](#2-requirements-compliance)
3. [Additional Functionality](#3-additional-functionality)
4. [Getting Started](#4-getting-started)
5. [API Reference](#5-api-reference)
6. [Configuration](#6-configuration)

---

## 1. Overview

This document describes the Product API backend, its implementation, and how it meets the specified requirements. Each requirement includes supporting evidence (file references and code snippets).

---

## 2. Requirements Compliance

### 2.1 Backend API Framework

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Backend API using a framework (Node.js, Java, etc.) | Met | Node.js with Express 5.x |

**Supporting evidence:**

- **File:** `package.json` — dependencies: `express`, `node`
- **File:** `src/app.js` — Express app setup and middleware wiring
- **File:** `src/server.js` — HTTP server start

```javascript
// src/app.js
const express = require("express");
const app = express();
app.use("/api/products", productRoutes);
```

---

### 2.2 File-Based Database

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File-based database for data storage | Met | SQLite via `better-sqlite3` |

**Supporting evidence:**

- **File:** `src/db/db.js` — SQLite database connection
- **File:** `src/db/initDb.js` — DB file creation and schema

```javascript
// src/db/db.js
const dbPath = path.join(__dirname, "../../data/products.sqlite");
const db = new Database(dbPath, { readonly: true });
```

Database file: `data/products.sqlite` (created under project root).

---

### 2.3 Product Database Schema

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Product database with title, price, category, image | Met | Schema defined in init script |

**Supporting evidence:**

- **File:** `src/db/initDb.js`

```sql
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
| image | TEXT | optional URL |

---

### 2.4 API Endpoint to Fetch Products

| Requirement | Status | Evidence |
|-------------|--------|----------|
| API endpoint to fetch products | Met | `GET /api/products` |

**Supporting evidence:**

- **File:** `src/routes/product.routes.js` — route registration
- **File:** `src/controllers/product.controller.js` — controller
- **File:** `src/services/product.service.js` — business logic

```javascript
// src/routes/product.routes.js
router.get("/", validateQuery, fetchProducts);
```

```javascript
// src/controllers/product.controller.js
const result = getProducts(req.query);
res.status(200).json(result);
```

---

### 2.5 Search, Category Filter, and Pagination

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Search support | Met | `?search=<term>` |
| Category filter | Met | `?category=<value>` |
| Pagination | Met | `?page=<n>&limit=<n>` |

**Supporting evidence:**

- **File:** `src/services/product.service.js` — query construction and parameters

```javascript
// Search: LOWER(title) LIKE with parameterized query
if (search) {
  where.push("LOWER(title) LIKE @search ESCAPE '\\'");
  params.search = `%${escapeLike(search.toLowerCase())}%`;
}

// Category filter
if (category) {
  where.push("category = @category");
  params.category = category;
}

// Pagination
LIMIT @limit OFFSET @offset
```

Query parameters:

| Param | Description | Example |
|-------|-------------|---------|
| search | Case-insensitive title search | `?search=shoes` |
| category | Filter by category | `?category=electronics` |
| page | Page number (default: 1) | `?page=2` |
| limit | Items per page 1–50 (default: 12) | `?limit=20` |

---

### 2.6 Basic Validation and Security

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Basic validation | Met | Query and input validation |
| Security checks | Met | Helmet, CORS, rate limiting, input sanitization |

**Supporting evidence:**

- **File:** `src/middleware/validateQuery.js` — query validation

```javascript
// Pagination: page must be positive integer; limit 1–50
if (page < 1 || !Number.isInteger(page)) {
  return res.status(400).json({ error: "Invalid pagination", ... });
}
if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
  return res.status(400).json({ error: "Invalid pagination", ... });
}
// Input length limits: search 100 chars, category 50 chars
search = toStr(req.query.search).trim().slice(0, MAX_SEARCH_LENGTH);
category = toStr(req.query.category).trim().slice(0, MAX_CATEGORY_LENGTH);
```

- **File:** `src/app.js` — security middleware

```javascript
app.use(helmet());           // Security headers
app.use(cors({ ... }));      // CORS
app.use(express.json({ limit: "10kb" }));  // Request body limit
```

- **File:** `src/middleware/rateLimiter.js` — rate limiting (100 req/min)

```javascript
rateLimit({ windowMs: 60 * 1000, max: 100, ... });
```

- **File:** `src/services/product.service.js` — LIKE escaping to prevent pattern abuse

```javascript
function escapeLike(str) {
  return str.replace(/[%_\\]/g, "\\$&");
}
```

---

### 2.7 Caching

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Caching optimization | Met | In-memory cache for product responses |

**Supporting evidence:**

- **File:** `src/utils/cache.js` — NodeCache setup

```javascript
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });  // 60 second TTL
```

- **File:** `src/services/product.service.js` — cache lookup and storage

```javascript
const cacheKey = `products:${search}:${category}:${page}:${limit}`;
if (cache.has(cacheKey)) return cache.get(cacheKey);
// ... fetch from DB ...
cache.set(cacheKey, response);
```

- Cache key: `products:{search}:{category}:{page}:{limit}`
- TTL: 60 seconds (configurable in `src/utils/cache.js`)

---

### 2.8 Indexing

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Database indexing | Met | Indexes on `category` and `title` |

**Supporting evidence:**

- **File:** `src/db/initDb.js`

```sql
CREATE INDEX IF NOT EXISTS idx_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_title ON products(title);
```

- `idx_category` — speeds up `WHERE category = ?`
- `idx_title` — supports search queries on `title` and `LOWER(title)`

---

## 3. Additional Functionality

| Feature | Description | Location |
|---------|-------------|----------|
| Centralized logging | Winston logger; console in dev, file logs in prod | `src/utils/logger.js` |
| Request logging | Method, path, status, duration, IP | `src/middleware/requestLogger.js` |
| Error handling | Global error and 404 handlers | `src/middleware/errorHandler.js` |
| Health endpoint | Liveness/readiness check | `GET /health` in `src/app.js` |
| Read-only DB | Application uses read-only SQLite connection | `src/db/db.js` |
| Idempotent init | `init-db` only seeds when table is empty | `src/db/initDb.js` |

---

## 4. Getting Started

```bash
npm install
npm run init-db    # Create DB and seed (run once)
npm start          # Start server on PORT (default 5000)
```

Default base URL: `http://localhost:5000`

---

## 5. API Reference

### GET /api/products

Returns products with optional search, category filter, and pagination.

**Query parameters**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 12 | Items per page (1–50) |
| search | string | No | — | Search in title |
| category | string | No | — | Filter by category |

**Example requests**

```bash
# Paginated list
curl "http://localhost:5000/api/products?page=1&limit=5"

# Search and filter
curl "http://localhost:5000/api/products?search=shoes&category=fashion"
```

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "title": "iPhone 15",
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

### GET /health

Health check for monitoring.

**Response**

```json
{
  "status": "OK"
}
```

---

## 6. Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | `production` enables file logging |
| CORS_ORIGIN | * | Allowed origins (comma-separated) |
| RATE_LIMIT_MAX | 100 | Max requests per minute |
| LOG_LEVEL | info (prod) / debug | Log verbosity |

**Production notes**

- Set `NODE_ENV=production`
- Set `CORS_ORIGIN` to your frontend URL(s)
- Logs: `logs/error.log`, `logs/combined.log`
- Ensure `data/products.sqlite` exists (via `npm run init-db`)
