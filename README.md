# Finance Dashboard — Backend API

A backend system for a role-based finance dashboard, built as part of a backend developer internship assignment. The API supports financial record management, user access control, and dashboard analytics — structured with clean separation of concerns across controllers, services, and middleware layers.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Auth](#1-authentication)
  - [Users & Roles](#2-user--role-management)
  - [Financial Records](#3-financial-records)
  - [Dashboard & Analytics](#4-dashboard--analytics)
  - [Categories](#5-categories)
- [Database](#database)
- [Error Handling](#error-handling)
- [Assumptions & Tradeoffs](#assumptions--tradeoffs)

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access token based) |
| Validation | Zod |
| Password Hashing | bcrypt |
| Rate Limiting | express-rate-limit |

---

##  Project Structure

```
finance-backend/
├── src/
│   ├── controllers/        # Route handlers (auth, users, records, dashboard, categories)
│   ├── services/           # Business logic layer
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── roleGuard.js    # Role-based access enforcement
│   │   ├── rateLimiter.js  # Per-route rate limiting
│   │   └── validate.js     # Zod schema validation
│   ├── models/             # DB schema / ORM models
│   ├── routes/             # Route definitions
│   ├── utils/              # Helpers (error classes, response formatter)
│   └── app.js              # Express app setup
├── server.js
├── app.js
├── package.json
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/finance-backend.git
cd finance-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev       # Development (with nodemon)
npm start         # Production
```

Server runs on `http://localhost:3000` by default.

---

##  Environment Variables

```env
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/finance_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
```

---

##  Authentication

The API uses **JWT-based authentication** with access tokens.

- **Access Token** — Short-lived (`15m`), sent in `Authorization: Bearer <token>` header on every request.
- **Logout** — Clears the session server-side so the token is no longer accepted.

All protected routes require a valid `Authorization` header. Requests without a token receive `401 Unauthorized`.

---

##  Role-Based Access Control

Three roles are supported. Access is enforced at the middleware level on every route.

| Role | Permissions |
|---|---|
| **Viewer** | Read financial records, view basic dashboard data |
| **Analyst** | All Viewer permissions + access to analytics, trends, and summaries |
| **Admin** | Full access — create/update/delete records, manage users and categories |

Role checks are applied via a `roleGuard` middleware. Unauthorized role access returns `403 Forbidden`.

---

##  Rate Limiting

Rate limiting is implemented using **`express-rate-limit`** (in-memory store, no external dependency). Each route group has its own limit tuned to expected usage patterns:

| Limiter | Routes Applied To | Max Requests | Window |
|---|---|---|---|
| `authLimiter` | `/auth/login`, `/auth/register` | 5 | 1 minute |
| `searchLimiter` | `/records` (with search/filter params) | 30 | 1 minute |
| `exportLimiter` | `/records/export` | 5 | 1 minute |
| `userLimiter` | `/users/*` | 50 | 1 minute |
| `dashboardLimiter` | `/dashboard/*` | 60 | 1 minute |
| `apiLimiter` | All other routes (global fallback) | 100 | 1 minute |

Auth endpoints are intentionally strict (5 req/min) to protect against brute-force attacks. Dashboard endpoints are more permissive since they are read-heavy. When a limit is exceeded, the API responds with `429 Too Many Requests`.

---

##  API Endpoints

Base URL: `/api`

All requests to protected routes must include:
```
Authorization: Bearer <access_token>
```

---

### 1. Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Admin | Create a new user account |
| `POST` | `/auth/login` | Public | Login and receive JWT tokens |
| `POST` | `/auth/logout` | All roles | Invalidate token and clear session |

#### POST `/auth/register`
**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass123",
  "role": "analyst"
}
```
**Responses:** `201 Created` · `400 Validation error` · `409 Email already exists` · `403 Not admin`

---

#### POST `/auth/login`
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepass123"
}
```
**Response:**
```json
{
  "accessToken": "...",
  "user": { "id": "...", "name": "Jane Doe", "role": "analyst" }
}
```
**Responses:** `200 OK` · `401 Invalid credentials` · `403 Account inactive`

---

#### POST `/auth/logout`
**Headers:** `Authorization: Bearer <token>`
**Responses:** `200 OK` · `401 Unauthorized`

---

### 2. User & Role Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List all users (paginated) |
| `GET` | `/users/:id` | Admin | Get single user details |
| `POST` | `/users` | Admin | Create new user |
| `PUT` | `/users/:id` | Admin | Update user info or status |
| `PATCH` | `/users/:id/role` | Admin | Assign or change user role |
| `DELETE` | `/users/:id` | Admin | Soft-delete / deactivate user |

#### GET `/users`
**Query Params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, max 100 |
| `role` | enum | Filter by `viewer` / `analyst` / `admin` |
| `is_active` | boolean | Filter by account status |

**Response:** `{ data: [...], total, page, pages }`

---

#### PATCH `/users/:id/role`
**Body:**
```json
{ "role": "analyst" }
```
**Responses:** `200 OK` · `400 Invalid role` · `404 Not found`

---

#### DELETE `/users/:id`
Performs a **soft delete** — sets `is_active = false` rather than removing the record. The user is immediately logged out server-side.

**Responses:** `204 No Content` · `404 Not found` · `403 Cannot delete self`

---

### 3. Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/records` | Viewer+ | List records with filters |
| `GET` | `/records/:id` | Viewer+ | Get single record |
| `POST` | `/records` | Admin | Create a new financial entry |
| `PUT` | `/records/:id` | Admin | Replace a record |
| `GET` | `/records/search` | Analyst+ | Search financial records |
| `DELETE` | `/records/:id` | Admin | Soft-delete a record |
| `GET` | `/records/export` | Admin | Export records as CSV |

#### GET `/records`
**Query Params:**

| Param | Type | Description |
|---|---|---|
| `type` | enum | `income` or `expense` |
| `category_id` | string | Filter by category |
| `date_from` | date | Format: `YYYY-MM-DD` |
| `date_to` | date | Format: `YYYY-MM-DD` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

---

#### POST `/records`
**Body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category_id": "category_id_here",
  "date": "2024-06-15",
  "notes": "June salary"
}
```
**Responses:** `201 Created` · `400 Validation error` · `404 Category not found`

---

### 4. Dashboard & Analytics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Viewer+ | Total income, expenses, net balance |
| `GET` | `/dashboard/by-category` | Analyst+ | Category-wise totals |
| `GET` | `/dashboard/trends/monthly` | Analyst+ | Monthly income/expense breakdown |
| `GET` | `/dashboard/trends/weekly` | Analyst+ | Week-over-week activity |
| `GET` | `/dashboard/recent` | Viewer+ | Latest 10 transactions |
| `GET` | `/dashboard/balance-over-time` | Analyst+ | Running net balance for charts |
| `GET` | `/dashboard/top-categories` | Analyst+ | Get top 5 categories by total amount |

#### GET `/dashboard/summary`
**Response:**
```json
{
  "total_income": 120000.00,
  "total_expenses": 84500.00,
  "net_balance": 35500.00,
  "period": "all-time"
}
```

#### GET `/dashboard/trends/monthly`
**Query:** `?year=2024`
**Response:** `[{ month, income, expense, net }]`

#### GET `/dashboard/balance-over-time`
**Query:** `?from=YYYY-MM-DD&to=YYYY-MM-DD&interval=day|week|month`
**Response:** `[{ date, balance }]`

---

### 5. Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Viewer+ | List all categories |
| `POST` | `/categories` | Admin | Create a category |
| `PUT` | `/categories/:id` | Admin | Update a category |
| `DELETE` | `/categories/:id` | Admin | Delete a category |

---

##  Database

MongoDB is used for data storage via Mongoose.

**Collections:**
- `users` — stores user accounts, roles, and active status
- `financial_records` — stores all income and expense entries
- `categories` — stores record categories
- `sessions` — optional, used for logout handling (tracks active tokens)

---

##  Error Handling

All error responses follow a consistent format:

```json
{
  "result": "fail",
  "message": "Descriptive error message",
  "errors": [ ... ]   // Optional: validation error details
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad request / validation failure |
| `401` | Missing or invalid token |
| `403` | Insufficient role permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

##  Assumptions & Tradeoffs

- **In-memory rate limiting** — `express-rate-limit` uses an in-memory store by default, which means limits reset on server restart and do not share state across multiple instances. This is suitable for a single-server setup. For a distributed/production environment, a persistent store (e.g. Redis) would be the right choice.

- **Soft deletes** — Both users and financial records use soft deletion (`isDeleted` / `isActive` flags) rather than hard removal. This preserves data integrity and history.

- **Input validation** — All request bodies are validated with Zod schemas before reaching the controller. Invalid inputs receive a `400` with field-level error details.

- **Password security** — Passwords are hashed with `bcrypt` (cost factor 12) and are never stored or returned in plaintext.

- **MongoDB** — Mongoose is used as the ODM. Collections are schema-defined with appropriate indexes (e.g. unique index on `email`, indexes on `date` and `type` for record filtering).
