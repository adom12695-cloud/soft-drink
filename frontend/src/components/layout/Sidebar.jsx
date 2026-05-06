import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Warehouse,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Droplets,
  UserCircle,
  ShieldCheck,
} from 'lucide-react'

// ─── Nav link definitions per role ───────────────────────────────────────────
const NAV_LINKS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    roles: ['distributor', 'warehouse_manager', 'retailer', 'delivery_personnel'],
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
    roles: ['distributor'],
  },
  {
    label: 'User Management',
    to: '/users',
    icon: Users,
    roles: ['distributor'],
  },
  {
    label: 'Manage Products',
    to: '/products/manage',
    icon: ClipboardList,
    roles: ['distributor'],
  },
  {
    label: 'Product Catalog',
    to: '/products',
    icon: Package,
    roles: ['distributor', 'retailer', 'warehouse_manager'],
  },
  {
    label: 'Stock Control',
    to: '/stock',
    icon: Warehouse,
    roles: ['warehouse_manager', 'distributor'],
  },
  {
    label: 'All Orders',
    to: '/orders',
    icon: ClipboardList,
    roles: ['distributor'],
  },
  {
    label: 'Place Order',
    to: '/orders/new',
    icon: ShoppingCart,
    roles: ['retailer'],
  },
  {
    label: 'My Orders',
    to: '/orders',
    icon: ClipboardList,
    roles: ['retailer'],
  },
  {
    label: 'My Deliveries',
    to: '/deliveries',
    icon: Truck,
    roles: ['delivery_personnel'],
  },
  // ── Account (all roles) ──
  {
    label: 'My Profile',
    to: '/account/profile',
    icon: UserCircle,
    roles: ['distributor', 'warehouse_manager', 'retailer', 'delivery_personnel'],
  },
  {
    label: 'Security',
    to: '/account/security',
    icon: ShieldCheck,
    roles: ['distributor', 'warehouse_manager', 'retailer', 'delivery_personnel'],
  },
]

// ─── Role badge styles ────────────────────────────────────────────────────────
const ROLE_STYLES = {
  distributor:        'bg-indigo-100 text-indigo-700',
  warehouse_manager:  'bg-blue-100 text-blue-700',
  retailer:           'bg-emerald-100 text-emerald-700',
  delivery_personnel: 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS = {
  distributor:        'Distributor',
  warehouse_manager:  'Warehouse Mgr',
  retailer:           'Retailer',
  delivery_personnel: 'Delivery',
}

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const visibleLinks = NAV_LINKS.filter((link) => link.roles.includes(role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        relative flex flex-col bg-slate-900 text-slate-100 min-h-screen flex-shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow">
          <Droplets size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight text-white tracking-wide">SoftDrink</p>
            <p className="text-xs text-slate-400 leading-tight">Distribution</p>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-slate-700 hover:bg-indigo-600
                   rounded-full flex items-center justify-center transition-colors z-10 shadow"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── User info ── */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-700/60">
          {/* Mini avatar */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl overflow-hidden flex-shrink-0
                            ${!user?.profilePicture ? (ROLE_STYLES[role]?.split(' ')[0] ?? 'bg-indigo-600') : ''}`}>
              {user?.profilePicture
                ? <img src={`http://localhost:5000${user.profilePicture}`} alt={user?.name}
                    className="w-full h-full object-cover" />
                : <div className={`w-full h-full flex items-center justify-center
                                  text-white text-sm font-bold ${ROLE_STYLES[role]?.split(' ')[0] ?? 'bg-indigo-600'}`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <span className={`badge ${ROLE_STYLES[role] ?? 'bg-slate-700 text-slate-300'}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={`${link.to}-${link.label}`}
              to={link.to}
              end={link.to === '/orders'} // prevent /orders matching /orders/new
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-colors duration-150
                 ${isActive
                   ? 'bg-indigo-600 text-white shadow-sm'
                   : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                 }
                 ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? link.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-2 py-4 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-150
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
