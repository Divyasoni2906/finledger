# FinLedger — Finance Dashboard

A full-stack finance dashboard with role-based access control.

🔗 **Live Demo:** `https://finledger-new3.onrender.com`

---

## Overview

FinLedger allows users to manage and analyze financial data based on roles (Viewer, Analyst, Admin). It includes authentication, transaction management, and dashboard analytics.

---
<img width="1366" height="619" alt="Screenshot (310)" src="https://github.com/user-attachments/assets/b995ad14-69cb-4895-a5f6-372d8477a33a" />
For Admin:
<img width="1366" height="647" alt="Screenshot (311)" src="https://github.com/user-attachments/assets/049556ba-1019-4642-b8b2-2adc38bddbd5" />
<img width="1366" height="639" alt="Screenshot (312)" src="https://github.com/user-attachments/assets/4858a35f-66c9-413b-a45e-dbf0ccb74cb7" />
<img width="1366" height="648" alt="Screenshot (313)" src="https://github.com/user-attachments/assets/f6f64dc6-df4d-478e-bf37-226842333f71" />

For viewer:
<img width="1366" height="608" alt="Screenshot (314)" src="https://github.com/user-attachments/assets/2ce33e97-6ee7-4aeb-9baa-d2c8102a2cde" />


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


