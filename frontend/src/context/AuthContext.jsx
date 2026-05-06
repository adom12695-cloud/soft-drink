import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user:            null,
  token:           localStorage.getItem('token') || null,
  role:            null,
  isAuthenticated: false,
  isLoading:       true,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        role:            action.payload.user.role,
        isAuthenticated: true,
        isLoading:       false,
      }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    case 'LOGOUT':
      return { ...state, user: null, token: null, role: null, isAuthenticated: false, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'AUTH_ERROR':
      return { ...state, user: null, token: null, role: null, isAuthenticated: false, isLoading: false }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verify stored token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token')
      if (!token) { dispatch({ type: 'SET_LOADING', payload: false }); return }
      try {
        const res = await api.get('/auth/me')
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token } })
      } catch {
        localStorage.removeItem('token')
        dispatch({ type: 'AUTH_ERROR' })
      }
    }
    verifyToken()
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
    return user
  }

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/update-profile', data)
    dispatch({ type: 'UPDATE_USER', payload: res.data.user })
    return res.data.user
  }

  const uploadAvatar = async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await api.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    dispatch({ type: 'UPDATE_USER', payload: res.data.user })
    return res.data.user
  }

  const removeAvatar = async () => {
    const res = await api.delete('/auth/remove-avatar')
    dispatch({ type: 'UPDATE_USER', payload: res.data.user })
    return res.data.user
  }

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword })
    // Server issues a new token after password change
    const { token, user } = res.data
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
    return res.data
  }

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  }

  const resetPassword = async (email, code, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, code, newPassword })
    const { token: authToken, user } = res.data
    localStorage.setItem('token', authToken)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: authToken } })
    return res.data
  }

  // ── Role helpers ───────────────────────────────────────────────────────────
  const isDistributor       = state.role === 'distributor'
  const isWarehouseManager  = state.role === 'warehouse_manager'
  const isRetailer          = state.role === 'retailer'
  const isDeliveryPersonnel = state.role === 'delivery_personnel'
  const hasRole = (...roles) => roles.includes(state.role)

  return (
    <AuthContext.Provider value={{
      ...state,
      login, register, logout,
      updateProfile, changePassword,
      forgotPassword, resetPassword,
      uploadAvatar, removeAvatar,
      isDistributor, isWarehouseManager,
      isRetailer, isDeliveryPersonnel, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
