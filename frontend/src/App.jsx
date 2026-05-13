import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import PrivateRoute from './components/routing/PrivateRoute'
import Layout from './components/layout/Layout'

// Landing
import LandingPage from './pages/LandingPage'

// Auth
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'

// Shared
import DashboardPage    from './pages/DashboardPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProductsPage     from './pages/shared/ProductsPage'
import OrdersPage       from './pages/shared/OrdersPage'

// Distributor
import UserManagementPage from './pages/distributor/UserManagementPage'
import AnalyticsPage      from './pages/distributor/AnalyticsPage'
import AdminReportsPage   from './pages/distributor/AdminReportsPage'

// Warehouse
import StockPage              from './pages/warehouse/StockPage'
import WarehouseApprovalsPage from './pages/warehouse/WarehouseApprovalsPage'
import ReportsPage            from './pages/warehouse/ReportsPage'

// Retailer
import PlaceOrderPage from './pages/retailer/PlaceOrderPage'

// Delivery
import DeliveriesPage from './pages/delivery/DeliveriesPage'

// Account
import ProfilePage     from './pages/account/ProfilePage'
import EditProfilePage from './pages/account/EditProfilePage'
import SecurityPage    from './pages/account/SecurityPage'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px', borderRadius: '10px' },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* ── Public ── */}
            <Route path="/"               element={<LandingPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/unauthorized"   element={<UnauthorizedPage />} />

            {/* ── Protected: any authenticated user ── */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>

                {/* Dashboard — all roles */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* ── Distributor only ── */}
                <Route element={<PrivateRoute allowedRoles={['distributor']} />}>
                  <Route path="/analytics"       element={<AnalyticsPage />} />
                  <Route path="/admin-reports"   element={<AdminReportsPage />} />
                  <Route path="/users"           element={<UserManagementPage />} />
                  <Route path="/products/manage" element={<ProductsPage />} />
                </Route>

                {/* ── Warehouse + Distributor ── */}
                <Route element={<PrivateRoute allowedRoles={['warehouse_manager', 'distributor']} />}>
                  <Route path="/stock" element={<StockPage />} />
                </Route>

                {/* ── Warehouse only ── */}
                <Route element={<PrivateRoute allowedRoles={['warehouse_manager']} />}>
                  <Route path="/warehouse/approvals" element={<WarehouseApprovalsPage />} />
                  <Route path="/reports"             element={<ReportsPage />} />
                </Route>

                {/* ── Products catalog: distributor, warehouse, retailer ── */}
                <Route element={<PrivateRoute allowedRoles={['distributor', 'warehouse_manager', 'retailer']} />}>
                  <Route path="/products" element={<ProductsPage />} />
                </Route>

                {/* ── Orders: distributor + retailer ── */}
                <Route element={<PrivateRoute allowedRoles={['distributor', 'retailer']} />}>
                  <Route path="/orders" element={<OrdersPage />} />
                </Route>

                {/* ── Retailer only ── */}
                <Route element={<PrivateRoute allowedRoles={['retailer']} />}>
                  <Route path="/orders/new" element={<PlaceOrderPage />} />
                </Route>

                {/* ── Delivery Personnel only ── */}
                <Route element={<PrivateRoute allowedRoles={['delivery_personnel']} />}>
                  <Route path="/deliveries" element={<DeliveriesPage />} />
                </Route>

                {/* ── Account — all authenticated users ── */}
                <Route path="/account/profile"  element={<ProfilePage />} />
                <Route path="/account/edit"     element={<EditProfilePage />} />
                <Route path="/account/security" element={<SecurityPage />} />

              </Route>
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
