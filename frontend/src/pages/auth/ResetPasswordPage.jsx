import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Droplets, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number',     pass: /\d/.test(password) },
    { label: 'Contains a letter',     pass: /[a-zA-Z]/.test(password) },
  ]
  const score = checks.filter((c) => c.pass).length

  const bar = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500']
  const label = ['Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300
              ${i < score ? bar[score - 1] : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span key={c.label}
              className={`text-xs flex items-center gap-1 ${c.pass ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.pass ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${bar[score - 1].replace('bg-', 'text-')}`}>
            {label[score - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

const ResetPasswordPage = () => {
  const { token }          = useParams()
  const { resetPassword }  = useAuth()
  const navigate           = useNavigate()

  const [form, setForm]         = useState({ newPassword: '', confirm: '' })
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, form.newPassword)
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Token may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="card">
          {success ? (
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">Password Reset!</p>
                <p className="text-slate-500 text-sm mt-1">Redirecting you to the dashboard…</p>
              </div>
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={form.newPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className={`input-field ${form.confirm && form.confirm !== form.newPassword
                    ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Repeat new password"
                  required
                />
                {form.confirm && form.confirm !== form.newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting…</>
                ) : 'Reset Password'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-5 text-center">
              <Link to="/forgot-password"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
                <ArrowLeft size={14} /> Request a new code
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
