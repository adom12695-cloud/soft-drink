import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Phone, MapPin, FileText, Save, ArrowLeft } from 'lucide-react'
import AvatarUpload from '../../components/ui/AvatarUpload'
import toast from 'react-hot-toast'

const AVATAR_COLORS = [
  { key: 'indigo', label: 'Indigo',  cls: 'bg-indigo-600' },
  { key: 'blue',   label: 'Blue',    cls: 'bg-blue-600'   },
  { key: 'emerald',label: 'Green',   cls: 'bg-emerald-600'},
  { key: 'violet', label: 'Violet',  cls: 'bg-violet-600' },
  { key: 'rose',   label: 'Rose',    cls: 'bg-rose-600'   },
  { key: 'amber',  label: 'Amber',   cls: 'bg-amber-500'  },
  { key: 'slate',  label: 'Slate',   cls: 'bg-slate-600'  },
  { key: 'cyan',   label: 'Cyan',    cls: 'bg-cyan-600'   },
]

const EditProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    bio:     user?.bio     || '',
    avatar:  user?.avatar  || 'indigo',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required.'); return }
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated successfully!')
      navigate('/account/profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const selectedColor = AVATAR_COLORS.find((c) => c.key === form.avatar) ?? AVATAR_COLORS[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/account/profile')}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
          <p className="text-sm text-slate-500">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Avatar / profile picture */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <AvatarUpload size="w-24 h-24" />
            <div className="text-sm text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">Upload a photo</p>
              <p>JPG, PNG, GIF or WebP · Max 3 MB</p>
              <p className="text-xs text-slate-400">
                Hover over the image and click the camera icon to change it.
              </p>
            </div>
          </div>
        </div>

        {/* Avatar color picker */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Avatar Color</h3>
          <div className="flex items-center gap-5 flex-wrap">
            {/* Preview */}
            <div className={`w-20 h-20 rounded-2xl ${selectedColor.cls} flex items-center
                            justify-center text-white text-2xl font-black shadow-md flex-shrink-0`}>
              {initials || '?'}
            </div>
            {/* Color swatches */}
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: c.key })}
                  title={c.label}
                  className={`w-9 h-9 rounded-xl ${c.cls} transition-all duration-150
                    ${form.avatar === c.key
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Personal Information</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="name" value={form.name} onChange={handleChange}
                className="input-field pl-9" placeholder="Your full name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="phone" value={form.phone} onChange={handleChange}
                className="input-field pl-9" placeholder="+1 234 567 8900" type="tel" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="address" value={form.address} onChange={handleChange}
                className="input-field pl-9" placeholder="123 Main Street, City" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio
              <span className="text-slate-400 font-normal ml-1">
                ({form.bio.length}/200)
              </span>
            </label>
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-3 text-slate-400" />
              <textarea name="bio" value={form.bio} onChange={handleChange}
                className="input-field pl-9 resize-none" rows={3}
                placeholder="A short bio about yourself…"
                maxLength={200} />
            </div>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Account Info</h3>
          <p className="text-xs text-slate-400">These fields cannot be changed here.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <input value={user?.email || ''} disabled
                className="input-field bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
              <input value={user?.role?.replace('_', ' ') || ''} disabled
                className="input-field bg-slate-50 text-slate-400 cursor-not-allowed capitalize" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/account/profile')}
            className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
            ) : (
              <><Save size={16} />Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfilePage
