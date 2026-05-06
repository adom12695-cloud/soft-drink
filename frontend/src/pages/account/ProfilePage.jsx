import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  User, Mail, Phone, MapPin, Briefcase,
  Calendar, Edit3, ShieldCheck, Droplets,
} from 'lucide-react'
import AvatarUpload from '../../components/ui/AvatarUpload'

const ROLE_STYLES = {
  distributor:        { badge: 'bg-indigo-100 text-indigo-700', label: 'Distributor' },
  warehouse_manager:  { badge: 'bg-blue-100 text-blue-700',     label: 'Warehouse Manager' },
  retailer:           { badge: 'bg-emerald-100 text-emerald-700', label: 'Retailer' },
  delivery_personnel: { badge: 'bg-amber-100 text-amber-700',   label: 'Delivery Personnel' },
}

// Avatar with initials + color
const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-violet-600', 'bg-rose-600', 'bg-amber-500',
]

const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">
        {value || <span className="text-slate-400 italic font-normal">Not set</span>}
      </p>
    </div>
  </div>
)

const ProfilePage = () => {
  const { user } = useAuth()
  const roleInfo = ROLE_STYLES[user?.role] ?? { badge: 'bg-slate-100 text-slate-600', label: user?.role }
  const avatarColor = getAvatarColor(user?.name)
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Profile card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <AvatarUpload size="w-24 h-24" />
          </div>

          {/* Name + role */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              <span className={`badge ${roleInfo.badge}`}>{roleInfo.label}</span>
              <span className="badge bg-emerald-100 text-emerald-700">Active</span>
            </div>
            {user?.bio && (
              <p className="text-slate-600 text-sm mt-3 leading-relaxed max-w-md">{user.bio}</p>
            )}
          </div>

          {/* Edit button */}
          <a href="/account/edit"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200
                       hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600
                       rounded-lg text-sm font-medium transition-colors">
            <Edit3 size={15} />
            Edit Profile
          </a>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Personal info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <User size={15} className="text-indigo-500" />
            Personal Information
          </h3>
          <div className="mt-3">
            <InfoRow icon={User}     label="Full Name"  value={user?.name} />
            <InfoRow icon={Mail}     label="Email"      value={user?.email} />
            <InfoRow icon={Phone}    label="Phone"      value={user?.phone} />
            <InfoRow icon={MapPin}   label="Address"    value={user?.address} />
          </div>
        </div>

        {/* Account info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <Briefcase size={15} className="text-indigo-500" />
            Account Details
          </h3>
          <div className="mt-3">
            <InfoRow icon={Briefcase} label="Role"       value={roleInfo.label} />
            <InfoRow icon={ShieldCheck} label="Status"   value="Active" />
            <InfoRow icon={Calendar}  label="Member Since"
              value={user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })
                : null} />
            <InfoRow icon={Droplets}  label="Platform"  value="SoftDrink Distribution" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/account/edit"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200
                       hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
            <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl
                            flex items-center justify-center transition-colors">
              <Edit3 size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Edit Profile</p>
              <p className="text-xs text-slate-400">Update your personal info</p>
            </div>
          </a>
          <a href="/account/security"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200
                       hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
            <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl
                            flex items-center justify-center transition-colors">
              <ShieldCheck size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Security</p>
              <p className="text-xs text-slate-400">Change your password</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
