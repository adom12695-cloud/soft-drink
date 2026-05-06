# Soft Drink Distribution & Sales Management System

A full-stack supply chain management platform built with Node.js, Express, MongoDB, React, and Tailwind CSS.

---

## Project Structure

```
/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, login, getMe
│   │   ├── userController.js       # CRUD users (distributor only)
│   │   ├── productController.js    # CRUD products
│   │   ├── orderController.js      # Place, view, assign, update orders
│   │   └── stockController.js      # Stock in/out, logs, low-stock alerts
│   ├── middleware/
│   │   └── authMiddleware.js       # protect (JWT verify) + verifyRole (RBAC)
│   ├── models/
│   │   ├── User.js                 # Role-based user schema
│   │   ├── Product.js              # Product with stock tracking
│   │   ├── Order.js                # Order linking retailer + products + delivery
│   │   └── StockLog.js             # Audit trail for every stock movement
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── stockRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.js       # Main shell (sidebar + header + outlet)
    │   │   │   ├── Sidebar.js      # Role-aware collapsible sidebar
    │   │   │   └── Header.js       # Top bar with page title + user avatar
    │   │   └── routing/
    │   │       ├── PrivateRoute.js # Auth + role guard using React Router v6 Outlet
    │   │       └── RoleRoute.js    # Inline role-gating for component-level use
    │   ├── context/
    │   │   └── AuthContext.js      # Global auth state (user, role, token) via Context API
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   ├── DashboardPage.js    # Role-specific dashboard views
    │   │   └── UnauthorizedPage.js
    │   ├── services/
    │   │   └── api.js              # Axios instance with JWT interceptors
    │   ├── App.js                  # Route definitions with nested PrivateRoutes
    │   ├── index.js
    │   └── index.css               # Tailwind + custom component classes
    ├── tailwind.config.js
    └── package.json
```

---

## Roles & Permissions

| Feature                  | Distributor | Warehouse Manager | Retailer | Delivery Personnel |
|--------------------------|:-----------:|:-----------------:|:--------:|:------------------:|
| View Dashboard           | ✅          | ✅                | ✅       | ✅                 |
| Manage Users             | ✅          | ❌                | ❌       | ❌                 |
| Global Analytics         | ✅          | ❌                | ❌       | ❌                 |
| Create/Edit Products     | ✅          | ❌                | ❌       | ❌                 |
| Browse Product Catalog   | ✅          | ✅                | ✅       | ❌                 |
| Stock In / Stock Out     | ✅          | ✅                | ❌       | ❌                 |
| View Stock Logs          | ✅          | ✅                | ❌       | ❌                 |
| Place Orders             | ❌          | ❌                | ✅       | ❌                 |
| View Own Orders          | ❌          | ❌                | ✅       | ❌                 |
| View All Orders          | ✅          | ❌                | ❌       | ❌                 |
| Assign Delivery          | ✅          | ❌                | ❌       | ❌                 |
| Update Delivery Status   | ✅          | ❌                | ❌       | ✅                 |

---

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## API Endpoints

| Method | Endpoint                        | Access                          |
|--------|---------------------------------|---------------------------------|
| POST   | /api/auth/register              | Public                          |
| POST   | /api/auth/login                 | Public                          |
| GET    | /api/auth/me                    | Any authenticated               |
| GET    | /api/users                      | Distributor                     |
| PUT    | /api/users/:id                  | Distributor                     |
| PATCH  | /api/users/:id/toggle-status    | Distributor                     |
| DELETE | /api/users/:id                  | Distributor                     |
| GET    | /api/products                   | All authenticated               |
| POST   | /api/products                   | Distributor                     |
| PUT    | /api/products/:id               | Distributor                     |
| DELETE | /api/products/:id               | Distributor                     |
| GET    | /api/orders                     | Role-filtered                   |
| POST   | /api/orders                     | Retailer                        |
| PATCH  | /api/orders/:id/assign          | Distributor                     |
| PATCH  | /api/orders/:id/status          | Distributor, Delivery Personnel |
| GET    | /api/orders/analytics           | Distributor                     |
| POST   | /api/stock/in                   | Distributor, Warehouse Manager  |
| POST   | /api/stock/out                  | Distributor, Warehouse Manager  |
| GET    | /api/stock/logs                 | Distributor, Warehouse Manager  |
| GET    | /api/stock/low                  | Distributor, Warehouse Manager  |
