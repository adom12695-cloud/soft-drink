import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const [page, setPage]                   = useState(1)
  const [hasMore, setHasMore]             = useState(true)
  const pollRef = useRef(null)

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (reset = false) => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const p = reset ? 1 : page
      const res = await api.get(`/notifications?page=${p}&limit=20`)
      const { notifications: data, unreadCount: count, pages } = res.data

      setNotifications((prev) => reset ? data : [...prev, ...data])
      setUnreadCount(count)
      setPage(p + 1)
      setHasMore(p < pages)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, page])

  // ── Poll unread count every 30s ────────────────────────────────────────────
  const pollUnread = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch {
      // silent
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchNotifications(true)
    pollRef.current = setInterval(pollUnread, 30_000)
    return () => clearInterval(pollRef.current)
  }, [isAuthenticated])

  // ── Actions ────────────────────────────────────────────────────────────────
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch { /* silent */ }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      const deleted = notifications.find((n) => n._id === id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1))
    } catch { /* silent */ }
  }

  const clearAll = async () => {
    try {
      await api.delete('/notifications')
      setNotifications([])
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  const loadMore = () => {
    if (!loading && hasMore) fetchNotifications(false)
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, hasMore,
      markAsRead, markAllAsRead, deleteOne, clearAll, loadMore,
      refresh: () => fetchNotifications(true),
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
