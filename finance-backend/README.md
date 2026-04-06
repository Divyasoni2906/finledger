# Finance Backend API

A RESTful backend for a finance dashboard system built with **Node.js**, **Express**, and **SQLite** (via `sql.js` — pure WebAssembly, zero native dependencies).

---

## Tech Stack

| Layer        | Choice                                      |
|-------------|----------------------------------------------|
| Runtime      | Node.js                                     |
| Framework    | Express.js                                  |
| Database     | SQLite via `sql.js` (file: `finance.db`)    |
| Auth         | JWT (`jsonwebtoken`) + bcrypt passwords     |
| Validation   | `express-validator`                         |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── app.js                         # Entry point, Express setup
│   ├── models/
│   │   └── db.js                      # SQLite init, query helpers, persistence
│   ├── middleware/
│   │   ├── auth.js                    # JWT authentication + role authorization
│   │   └── validate.js                # express-validator error handler
│   ├── services/
│   │   ├── authService.js             # Register / login logic
│   │   ├── userService.js             # User CRUD
│   │   ├── transactionService.js      # Financial records + filters + soft delete
│   │   └── dashboardService.js        # Aggregated analytics queries
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── transactions.js
│   │   └── dashboard.js
│   └── utils/
│       └── seed.js                    # Demo data seeder
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file (already included):
```env
PORT=3000
JWT_SECRET=finance_dashboard_secret_key_2024
JWT_EXPIRES_IN=7d
```

### 3. Seed demo data
```bash
npm run seed
```
This creates 3 users and 60 randomised transactions spanning the last 12 months.

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@finance.dev      | admin123    |
| Analyst | analyst@finance.dev    | analyst123  |
| Viewer  | viewer@finance.dev     | viewer123   |

### 4. Start the server
```bash
npm start        # production
npm run dev      # development with nodemon
```

Server runs at: `http://localhost:3000`

---

## Role Permissions

| Action                          | Viewer | Analyst | Admin |
|---------------------------------|--------|---------|-------|
| Login / view own profile        | ✅     | ✅      | ✅    |
| View transactions               | ✅     | ✅      | ✅    |
| View dashboard summary & recent | ✅     | ✅      | ✅    |
| View category & trend analytics | ❌     | ✅      | ✅    |
| Create transactions             | ❌     | ✅      | ✅    |
| Update / delete transactions    | ❌     | ❌      | ✅    |
| Manage users (CRUD)             | ❌     | ❌      | ✅    |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /api/auth/register`
Register a new user (defaults to `viewer` role).

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

#### `POST /api/auth/login`
Login and receive a JWT token.

**Body:**
```json
{
  "email": "admin@finance.dev",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "role": "admin", ... }
}
```

#### `GET /api/auth/me` 🔒
Returns the currently authenticated user's profile.

---

### Users *(Admin only)*

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | `/api/users`      | List all users      |
| GET    | `/api/users/:id`  | Get user by ID      |
| POST   | `/api/users`      | Create a user       |
| PATCH  | `/api/users/:id`  | Update name/role/status |
| DELETE | `/api/users/:id`  | Delete a user       |

**Create user body:**
```json
{
  "name": "Bob Smith",
  "email": "bob@example.com",
  "password": "pass123",
  "role": "analyst"
}
```

**Update user body** (all fields optional):
```json
{
  "name": "Bob Updated",
  "role": "admin",
  "status": "inactive"
}
```

---

### Transactions

| Method | Endpoint                  | Roles              | Description            |
|--------|---------------------------|--------------------|------------------------|
| GET    | `/api/transactions`       | viewer/analyst/admin | List with filters    |
| GET    | `/api/transactions/:id`   | viewer/analyst/admin | Get single record    |
| POST   | `/api/transactions`       | analyst/admin      | Create transaction     |
| PATCH  | `/api/transactions/:id`   | admin              | Update transaction     |
| DELETE | `/api/transactions/:id`   | admin              | Soft delete            |

**GET /api/transactions — Query parameters:**

| Param     | Type   | Example         | Description              |
|-----------|--------|-----------------|--------------------------|
| type      | string | `income`        | Filter by type           |
| category  | string | `Rent`          | Filter by category (case-insensitive) |
| dateFrom  | string | `2024-01-01`    | Start date (YYYY-MM-DD)  |
| dateTo    | string | `2024-12-31`    | End date (YYYY-MM-DD)    |
| page      | number | `1`             | Page number              |
| limit     | number | `20`            | Results per page (max 100)|

**Create transaction body:**
```json
{
  "amount": 2500.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-07-01",
  "notes": "Monthly salary"
}
```

---

### Dashboard

| Method | Endpoint                          | Roles              | Description                        |
|--------|-----------------------------------|--------------------|-------------------------------------|
| GET    | `/api/dashboard/summary`          | all                | Total income, expenses, net balance |
| GET    | `/api/dashboard/recent?limit=10`  | all                | Recent transactions                |
| GET    | `/api/dashboard/categories`       | analyst/admin      | Totals grouped by category         |
| GET    | `/api/dashboard/trends/monthly?year=2024` | analyst/admin | Monthly income/expense trends  |
| GET    | `/api/dashboard/trends/weekly?weeks=8`    | analyst/admin | Weekly trends (last N weeks)   |

**Summary response example:**
```json
{
  "totalIncome": 24500.00,
  "totalExpenses": 8320.50,
  "netBalance": 16179.50,
  "transactionCount": 60
}
```

**Category totals example:**
```json
[
  { "category": "Rent",   "income": 0,     "expense": 3200, "net": -3200, "count": 4 },
  { "category": "Salary", "income": 18000, "expense": 0,    "net": 18000, "count": 6 }
]
```

---

### Health Check

#### `GET /api/health`
```json
{ "status": "ok", "timestamp": "2024-07-01T10:00:00.000Z" }
```

---

## Error Responses

All errors follow this format:

```json
{ "error": "Human-readable error message" }
```

Validation errors include details:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad request / validation error |
| 401    | Missing or invalid token       |
| 403    | Insufficient role permissions  |
| 404    | Resource not found             |
| 409    | Conflict (e.g. duplicate email)|
| 500    | Internal server error          |

---

## Design Decisions & Assumptions

- **SQLite via `sql.js`**: Chosen for zero native-build dependencies. The database is stored as `finance.db` and loaded into memory on startup; every write is persisted to disk immediately.
- **Soft deletes**: Transactions are never hard-deleted. A `deleted` flag is set so historical data is preserved. Users are hard-deleted since they have no financial audit trail requirement.
- **Role hierarchy**: Three roles — `viewer`, `analyst`, `admin` — enforced at the route level via `authorize()` middleware. No role inherits from another explicitly; permissions are declared per route.
- **JWT authentication**: Tokens are stateless and expire in 7 days. There is no refresh token mechanism (out of scope for this assessment).
- **Self-deletion guard**: An admin cannot delete their own account to prevent accidental lockout.
- **Public registration**: `/api/auth/register` is open and defaults to `viewer`. Promoting roles requires an existing admin via `PATCH /api/users/:id`.
- **Pagination**: Transaction listing is paginated (default page size 20, max 100).

---

## Frontend (React + Tailwind)

The frontend is a React SPA built with **Vite**, **Tailwind CSS v4**, **React Router**, and **Recharts**. It lives in `../finance-frontend/` and is served by the same Express server after building.

### Frontend structure

```
finance-frontend/
├── src/
│   ├── api/client.js           API client with JWT auth + auto-logout on 401
│   ├── context/AuthContext.jsx React context for login state
│   ├── hooks/useToast.js       Toast state + currency/date formatters
│   ├── components/
│   │   ├── ui.jsx              Card, Badge, Button, Input, Modal, Toast, Avatar
│   │   ├── Sidebar.jsx         Role-aware navigation sidebar
│   │   └── Layout.jsx          Protected route wrapper (redirects to /login)
│   └── pages/
│       ├── Login.jsx           Dark login page with one-click demo account chips
│       ├── Dashboard.jsx       Stats, area chart, top categories, recent activity
│       ├── Transactions.jsx    Filterable table, pagination, add/delete modal
│       ├── Analytics.jsx       Bar chart + pie charts + category table (analyst+)
│       └── Users.jsx           User management table + create modal (admin only)
└── vite.config.js              Tailwind v4 plugin + /api proxy to backend
```

### Running in development (hot reload)

Open **two terminals**:

```bash
# Terminal 1 — backend
cd finance-backend
npm start

# Terminal 2 — frontend dev server (proxies /api to port 3000)
cd finance-frontend
npm run dev
```

Frontend dev server runs on **http://localhost:5173**

### Running in production (single server)

```bash
# 1. Build the React app
cd finance-frontend && npm run build

# 2. Start the backend — it serves both API and built frontend
cd ../finance-backend && npm start
```

Visit **http://localhost:3000** — both API and React app served from one process.

### Deploying to Railway

1. Push both folders to a GitHub repo
2. Railway → New Project → Deploy from GitHub → select repo
3. Set these environment variables in Railway dashboard:
   - `JWT_SECRET` → any long random string
   - `NODE_ENV` → `production`
4. Set start command: `cd finance-frontend && npm install && npm run build && cd ../finance-backend && npm install && npm run seed && npm start`

The single Express server serves the React SPA and all API routes.
