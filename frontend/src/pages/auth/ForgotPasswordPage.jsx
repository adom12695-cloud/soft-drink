import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Droplets, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── 6-box OTP input ──────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([])
  const digits = value.split('')

  const handleKey = (e, idx) => {
    const key = e.key

    if (key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[idx]) {
        next[idx] = ''
        onChange(next.join(''))
      } else if (idx > 0) {
        next[idx - 1] = ''
        onChange(next.join(''))
        inputs.current[idx - 1]?.focus()
      }
      return
    }

    if (key === 'ArrowLeft' && idx > 0) { inputs.current[idx - 1]?.focus(); return }
    if (key === 'ArrowRight' && idx < 5) { inputs.current[idx + 1]?.focus(); return }

    if (/^\d$/.test(key)) {
      e.preventDefault()
      const next = [...digits]
      next[idx] = key
      onChange(next.join(''))
      if (idx < 5) inputs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}} // controlled via onKeyDown
          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none
            transition-all duration-150 bg-white
            ${digits[i]
              ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
              : 'border-slate-300 text-slate-800'}
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

// ─── Password strength bar ────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null
  const checks = [
    { label: '6+ chars',   pass: password.length >= 6 },
    { label: 'Has number', pass: /\d/.test(password) },
    { label: 'Has letter', pass: /[a-zA-Z]/.test(password) },
    { label: '8+ chars',   pass: password.length >= 8 },
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
      <div className="flex justify-between items-center">
        <div className="flex gap-3 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs ${c.pass ? 'text-emerald-600' : 'text-slate-400'}`}>
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-bold ${colors[score - 1].replace('bg-', 'text-')}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ForgotPasswordPage = () => {
  const { forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  // Step 1: email entry
  const [email, setEmail]     = useState('')
  const [sending, setSending] = useState(false)
  const [step, setStep]       = useState(1) // 1 = email, 2 = code + new password

  // Step 2: code + new password
  const [code, setCode]           = useState('')
  const [newPassword, setNewPw]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [resending, setResending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)

  // Countdown timer for resend
  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: send code ──────────────────────────────────────────────────────
  const handleSendCode = async (e) => {
    e?.preventDefault()
    setSending(true)
    try {
      await forgotPassword(email)
      setStep(2)
      setCountdown(60)
      toast.success(`Code sent to ${email}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code.')
    } finally {
      setSending(false)
    }
  }

  // ── Resend code ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await forgotPassword(email)
      setCode('')
      setCountdown(60)
      toast.success('New code sent!')
    } catch (err) {
      toast.error('Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  // ── Step 2: verify code + reset password ──────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Enter the full 6-digit code.'); return }
    if (newPassword !== confirm) { toast.error('Passwords do not match.'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return }

    setSubmitting(true)
    try {
      await resetPassword(email, code, newPassword)
      setSuccess(true)
      toast.success('Password reset! Redirecting…')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.')
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 1 ? 'Forgot Password' : 'Enter Reset Code'}
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            {step === 1
              ? "Enter your email and we'll send a 6-digit code"
              : `We sent a code to ${email}`}
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                transition-all duration-300
                ${step >= s ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`flex-1 h-0.5 max-w-[60px] rounded transition-all duration-300
                  ${step > s ? 'bg-indigo-500' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card">

          {/* ── Success state ── */}
          {success ? (
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">Password Reset!</p>
                <p className="text-slate-500 text-sm mt-1">Redirecting to your dashboard…</p>
              </div>
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>

          ) : step === 1 ? (
            /* ── Step 1: Email form ── */
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {sending
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending code…</>
                  : 'Send Reset Code'}
              </button>
            </form>

          ) : (
            /* ── Step 2: Code + new password ── */
            <form onSubmit={handleReset} className="space-y-6">

              {/* OTP boxes */}
              <div>
                <p className="text-sm font-medium text-slate-700 text-center mb-4">
                  Enter the 6-digit code
                </p>
                <OtpInput value={code} onChange={setCode} />

                {/* Resend */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors
                      ${countdown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                  </button>
                  <span className="text-slate-300">·</span>
                  <button type="button" onClick={() => { setStep(1); setCode('') }}
                    className="text-sm text-slate-500 hover:text-slate-700">
                    Change email
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* New password */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="input-field pr-10"
                      placeholder="Min. 6 characters"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`input-field ${confirm && confirm !== newPassword
                      ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="Repeat new password"
                    required
                  />
                  {confirm && confirm !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting…</>
                  : <><ShieldCheck size={16} />Reset Password</>}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-5 text-center">
              <Link to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
