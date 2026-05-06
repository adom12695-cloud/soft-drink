import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, Lock, ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ─── Password strength indicator ─────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null
  const checks = [
    { label: '6+ characters', pass: password.length >= 6 },
    { label: 'Has number',    pass: /\d/.test(password) },
    { label: 'Has letter',    pass: /[a-zA-Z]/.test(password) },
    { label: '8+ characters', pass: password.length >= 8 },
  ]
  const score = checks.filter((c) => c.pass).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300
            ${i < score ? colors[score - 1] : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs ${c.pass ? 'text-emerald-600' : 'text-slate-400'}`}>
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${colors[score - 1].replace('bg-', 'text-')}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Change Password Form ─────────────────────────────────────────────────────
const ChangePasswordForm = () => {
  const { changePassword } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      toast.error('New passwords do not match.')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const PasswordInput = ({ field, label, placeholder, showKey }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="input-field pl-9 pr-10"
          placeholder={placeholder}
          required
        />
        <button type="button" onClick={() => toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput field="currentPassword" label="Current Password"
        placeholder="Enter current password" showKey="current" />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={show.new ? 'text' : 'password'}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="input-field pl-9 pr-10"
            placeholder="Enter new password"
            required
          />
          <button type="button" onClick={() => toggle('new')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show.new ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <PasswordStrength password={form.newPassword} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={show.confirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className={`input-field pl-9 pr-10 ${
              form.confirm && form.confirm !== form.newPassword
                ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Repeat new password"
            required
          />
          <button type="button" onClick={() => toggle('confirm')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.confirm && form.confirm !== form.newPassword && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating…</>
        ) : (
          <><ShieldCheck size={16} />Update Password</>
        )}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const SecurityPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/account/profile')}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
          <p className="text-sm text-slate-500">Manage your password and account security</p>
        </div>
      </div>

      {/* Account info banner */}
      <div className="card bg-indigo-50 border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-indigo-900 text-sm">{user?.name}</p>
            <p className="text-indigo-600 text-xs">{user?.email}</p>
          </div>
          <span className="ml-auto badge bg-emerald-100 text-emerald-700">Secure</span>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-slate-800">Change Password</h3>
        </div>
        <ChangePasswordForm />
      </div>

      {/* Security tips */}
      <div className="card bg-slate-50 border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Security Tips</h3>
        <ul className="space-y-2">
          {[
            'Use a unique password not used on other sites',
            'Include a mix of letters, numbers, and symbols',
            'Never share your password with anyone',
            'Change your password regularly',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
              <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Danger zone */}
      <div className="card border-red-200">
        <h3 className="text-sm font-semibold text-red-700 mb-3">Session</h3>
        <p className="text-sm text-slate-500 mb-4">
          Sign out of your account on this device.
        </p>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600
                     hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default SecurityPage
