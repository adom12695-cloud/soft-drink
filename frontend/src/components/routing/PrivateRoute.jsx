import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * PrivateRoute
 *
 * Wraps protected routes. Redirects to /login if not authenticated.
 * Accepts optional `allowedRoles` array to restrict by role.
 *
 * Usage (any authenticated user):
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * Usage (distributor only):
 *   <Route element={<PrivateRoute allowedRoles={['distributor']} />}>
 *     <Route path="/users" element={<UserManagement />} />
 *   </Route>
 */
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth()
  const location = useLocation()

  // While verifying the stored token show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verifying session…</p>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role → redirect to unauthorized page
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default PrivateRoute
