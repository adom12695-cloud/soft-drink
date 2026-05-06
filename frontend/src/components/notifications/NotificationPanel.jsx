import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import {
  Bell, CheckCheck, Trash2, X, ShoppingCart,
  Truck, Package, AlertTriangle, Info, Warehouse,
} from 'lucide-react'

// ─── Icon + color per notification type ──────────────────────────────────────
const TYPE_CONFIG = {
  order_placed:    { icon: ShoppingCart, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  order_confirmed: { icon: CheckCheck,   bg: 'bg-blue-100',   color: 'text-blue-600'   },
  order_dispatched:{ icon: Truck,        bg: 'bg-amber-100',  color: 'text-amber-600'  },
  order_delivered: { icon: Package,      bg: 'bg-emerald-100',color: 'text-emerald-600'},
  order_cancelled: { icon: X,            bg: 'bg-red-100',    color: 'text-red-600'    },
  stock_low:       { icon: AlertTriangle,bg: 'bg-orange-100', color: 'text-orange-600' },
  stock_in:        { icon: Warehouse,    bg: 'bg-emerald-100',color: 'text-emerald-600'},
  stock_out:       { icon: Warehouse,    bg: 'bg-red-100',    color: 'text-red-600'    },
  user_created:    { icon: Info,         bg: 'bg-violet-100', color: 'text-violet-600' },
  system:          { icon: Info,         bg: 'bg-slate-100',  color: 'text-slate-600'  },
}

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ─── Single notification row ──────────────────────────────────────────────────
const NotifItem = ({ notif, onRead, onDelete }) => {
  const navigate = useNavigate()
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system
  const Icon = cfg.icon

  const handleClick = () => {
    if (!notif.isRead) onRead(notif._id)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors
        cursor-pointer group relative
        ${!notif.isRead ? 'bg-indigo-50/50' : ''}`}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {!notif.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5
                         bg-indigo-500 rounded-full flex-shrink-0" />
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon size={16} className={cfg.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
        <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif._id) }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg
                   text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
        aria-label="Delete notification"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
const NotificationPanel = ({ onClose }) => {
  const {
    notifications, unreadCount, loading, hasMore,
    markAsRead, markAllAsRead, deleteOne, clearAll, loadMore,
  } = useNotifications()

  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)]
                 bg-white rounded-2xl shadow-xl border border-slate-200 z-50
                 flex flex-col overflow-hidden"
      style={{ maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-indigo-600" />
          <span className="font-semibold text-slate-800 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800
                         font-medium px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              All read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600
                         font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear all"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
          <button onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Bell size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotifItem
                key={n._id}
                notif={n}
                onRead={markAsRead}
                onDelete={deleteOne}
              />
            ))}
            {hasMore && (
              <div className="px-4 py-3 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="text-xs text-indigo-600 hover:underline font-medium disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel
