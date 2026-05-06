import React, { useRef, useState } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

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

/**
 * AvatarUpload
 * Renders the user's avatar (photo or initials) with an upload overlay.
 * Props:
 *   size   — tailwind size class for the container, default 'w-24 h-24'
 *   onDone — optional callback after successful upload/remove
 */
const AvatarUpload = ({ size = 'w-24 h-24', onDone }) => {
  const { user, uploadAvatar, removeAvatar } = useAuth()
  const inputRef  = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const initials   = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarBg   = AVATAR_COLOR_MAP[user?.avatar] ?? 'bg-indigo-600'
  const pictureSrc = preview || (user?.profilePicture ? `${API_BASE}${user.profilePicture}` : null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3 MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      await uploadAvatar(file)
      toast.success('Profile picture updated!')
      setPreview(null) // use the server URL now
      onDone?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.')
      setPreview(null)
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!user?.profilePicture) return
    setUploading(true)
    try {
      await removeAvatar()
      toast.success('Profile picture removed.')
      setPreview(null)
      onDone?.()
    } catch {
      toast.error('Failed to remove picture.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div className={`${size} rounded-2xl overflow-hidden flex-shrink-0 shadow-md`}>
        {pictureSrc ? (
          <img
            src={pictureSrc}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${avatarBg} flex items-center justify-center
                          text-white font-black text-3xl select-none`}>
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100
                     flex items-center justify-center transition-opacity rounded-2xl
                     disabled:cursor-not-allowed"
          aria-label="Change profile picture"
        >
          {uploading
            ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera size={22} className="text-white drop-shadow" />}
        </button>
      </div>

      {/* Camera badge */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-700
                   rounded-full flex items-center justify-center shadow-md
                   border-2 border-white transition-colors disabled:opacity-50"
        aria-label="Upload photo"
      >
        <Upload size={12} className="text-white" />
      </button>

      {/* Remove button — only shown if there's a photo */}
      {user?.profilePicture && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600
                     rounded-full flex items-center justify-center shadow-md
                     border-2 border-white transition-colors"
          aria-label="Remove photo"
          title="Remove photo"
        >
          <Trash2 size={10} className="text-white" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default AvatarUpload
