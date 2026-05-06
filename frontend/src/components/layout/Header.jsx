import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { Bell, UserCircle, ShieldCheck, LogOut, Edit3, ChevronDown } from 'lucide-react'
import NotificationPanel from '../notifications/NotificationPanel'

const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/analytics':        'Analytics',
  '/users':            'User Management',
  '/products':         'Product Catalog',
  '/products/manage':  'Manage Products',
  '/stock':            'Stock Control',
  '/orders':           'Orders',
  '/orders/new':       'Place New Order',
  '/deliveries':       'My Deliveries',
  '/account/profile':  'My Profile',
  '/account/edit':     'Edit Profile',
  '/account/security': 'Security Settings',
}

const AVATAR_COLOR_MAP = {
  indigo:  'bg-indigo-600',
  blue:    'bg-blue-600',
  emerald: 'bg-emerald-600',
  violet:  'bg-violet-600',
  rose:    'bg-rose-600',
  amber:   'bg-amber-500',
  slate:   'bg-slate-600',
  cyan:    'bg-cyan-600',
}

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const Header = () => {
  const { user, logout }       = useAuth()
  const { unreadCount }        = useNotifications()
  const location               = useLocation()
  const navigate               = useNavigate()
  const [dropOpen, setDropOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropRef  = useRef(null)
  const notifRef = useRef(null)

  const pageTitle  = PAGE_TITLES[location.pathname] ?? 'Dashboard'
  const initials   = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarBg   = AVATAR_COLOR_MAP[user?.avatar] ?? 'bg-indigo-600'
  const pictureSrc = user?.profilePicture ? `${API_BASE}${user.profilePicture}` : null

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">

        {/* ── Notification bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false) }}
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50
                       rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                               bg-red-500 text-white text-[10px] font-bold rounded-full
                               flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* ── Profile dropdown ── */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100
                       transition-colors"
            aria-label="Account menu"
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0
                            ${!pictureSrc ? avatarBg : ''} flex items-center justify-center`}>
              {pictureSrc ? (
                <img src={pictureSrc} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold select-none">{initials}</span>
              )}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize leading-tight">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200
              ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg
                            border border-slate-200 py-1.5 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                                ${!pictureSrc ? avatarBg : ''} flex items-center justify-center`}>
                  {pictureSrc
                    ? <img src={pictureSrc} alt={user?.name} className="w-full h-full object-cover" />
                    : <span className="text-white text-sm font-bold">{initials}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="py-1">
                <Link to="/account/profile" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700
                             hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <UserCircle size={16} className="text-slate-400" />
                  My Profile
                </Link>
                <Link to="/account/edit" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700
                             hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Edit3 size={16} className="text-slate-400" />
                  Edit Profile
                </Link>
                <Link to="/account/security" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700
                             hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <ShieldCheck size={16} className="text-slate-400" />
                  Security
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600
                             hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
