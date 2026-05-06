import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * RoleRoute — inline role-gating for component-level use.
 *
 * Usage:
 *   <RoleRoute roles={['distributor', 'warehouse_manager']}>
 *     <StockPanel />
 *   </RoleRoute>
 */
const RoleRoute = ({ roles, children, fallback = null }) => {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!roles.includes(role)) {
    return fallback || <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RoleRoute
