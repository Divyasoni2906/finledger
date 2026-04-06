# FinLedger — Finance Dashboard

A full-stack finance dashboard with role-based access control.

🔗 **Live Demo:** `https://finledger-new3.onrender.com`

---

## Overview

FinLedger allows users to manage and analyze financial data based on roles (Viewer, Analyst, Admin). It includes authentication, transaction management, and dashboard analytics.

---

## Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Node.js + Express
* **Database:** SQLite (`sql.js`)
* **Auth:** JWT + bcrypt

---

## Project Structure

```bash
finledger/
├── finance-backend/
├── finance-frontend/
```

---

## Roles

* **Viewer:** View data
* **Analyst:** Create transactions + view analytics
* **Admin:** Full access (manage users & data)

---

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/finledger.git
cd finledger

# Install
cd finance-backend && npm install
cd ../finance-frontend && npm install
```

### Run

```bash
# Backend
cd finance-backend
npm start

# Frontend
cd finance-frontend
npm run dev
```

---

## Deployment (Render)

1. Create Web Service on Render
2. Set root directory: `finance-backend`

**Build:**

```bash
npm install
```

**Start:**

```bash
node src/app.js
```

### Environment Variables

```env
PORT=3000
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
```

### Build Frontend

```bash
cd finance-frontend
npm run build
```

---

## API

* `/api/auth`
* `/api/users`
* `/api/transactions`
* `/api/dashboard`

---

## Demo Accounts

* Admin → `admin@finance.dev / admin123`
* Analyst → `analyst@finance.dev / analyst123`
* Viewer → `viewer@finance.dev / viewer123`

---


