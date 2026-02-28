# Product Backend API

Node.js/Express backend API with file-based SQLite database, product catalog, search, filters, pagination, validation, security, and centralized logging.

## Requirements Satisfied

| Requirement | Status |
|-------------|--------|
| Backend API (Node.js + Express) | ✅ |
| File-based database (SQLite) | ✅ |
| Product schema: title, price, category, image | ✅ |
| Fetch products endpoint | ✅ GET /api/products |
| Search | ✅ `?search=term` |
| Category filter | ✅ `?category=electronics` |
| Pagination | ✅ `?page=1&limit=12` |
| Basic validation | ✅ Page, limit, input sanitization |
| Security checks | ✅ Helmet, CORS, rate limiting, input limits |
| Centralized logger | ✅ Winston |
| Production ready | ✅ Error handling, request logging |

## Quick Start

```bash
npm install
npm run init-db    # Create DB and seed sample products (run once)
npm start
```

Server runs at `http://localhost:5000` (or `PORT` env).

## API

### GET /api/products

Fetch products with optional filters.

| Query Param | Type | Description |
|-------------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page 1–50 (default: 12) |
| `search` | string | Search in title (case-insensitive) |
| `category` | string | Filter by category |

**Example**

```bash
curl "http://localhost:5000/api/products?page=1&limit=5"
curl "http://localhost:5000/api/products?search=shoes&category=fashion"
```

**Response**

```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 12, "total": 200, "totalPages": 17 }
}
```

### GET /health

Health check.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `production` enables file logs |
| `CORS_ORIGIN` | Allowed origins, comma-separated |
| `RATE_LIMIT_MAX` | Max requests per minute (default: 100) |
| `LOG_LEVEL` | `error`, `warn`, `info`, `debug` |

## Production

- Set `NODE_ENV=production`
- Set `CORS_ORIGIN` to your frontend URL(s)
- Logs: `logs/error.log`, `logs/combined.log`
- Ensure `data/products.sqlite` exists (run `npm run init-db` first)
