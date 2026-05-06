import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Droplets } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'retailer',           label: 'Retailer' },
  { value: 'warehouse_manager',  label: 'Warehouse Manager' },
  { value: 'delivery_personnel', label: 'Delivery Personnel' },
  { value: 'distributor',        label: 'Distributor (Admin)' },
]

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'retailer', phone: '', address: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the distribution network</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input id="name" type="text" name="name" value={form.name}
                  onChange={handleChange} className="input-field" placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select id="role" name="role" value={form.role} onChange={handleChange} className="input-field">
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input id="reg-email" type="email" name="email" value={form.email}
                onChange={handleChange} className="input-field" placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input id="reg-password" type="password" name="password" value={form.password}
                onChange={handleChange} className="input-field" placeholder="Min. 6 characters"
                required minLength={6} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input id="phone" type="tel" name="phone" value={form.phone}
                  onChange={handleChange} className="input-field" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                  Address <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input id="address" type="text" name="address" value={form.address}
                  onChange={handleChange} className="input-field" placeholder="123 Main St" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
