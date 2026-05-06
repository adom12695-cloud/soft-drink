import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { Truck, CheckCircle, MapPin, X } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
}

// ─── Update Status Modal ──────────────────────────────────────────────────────
const UpdateStatusModal = ({ order, onClose, onUpdated }) => {
  const [status, setStatus]   = useState(order.status)
  const [saving, setSaving]   = useState(false)

  const ALLOWED = order.status === 'confirmed'
    ? ['dispatched']
    : order.status === 'dispatched'
    ? ['delivered']
    : []

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/orders/${order._id}/status`, { status })
      toast.success(`Order marked as ${status}.`)
      onUpdated()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Update Delivery Status</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Order</p>
            <p className="font-mono text-indigo-600 font-semibold">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Delivery Address</p>
            <p className="text-sm text-slate-700">{order.deliveryAddress}</p>
          </div>

          {ALLOWED.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
              No further status updates available for this order.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Set Status</p>
              {ALLOWED.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-sm font-medium
                    ${status === s
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  {s === 'dispatched' ? <Truck size={16} /> : <CheckCircle size={16} />}
                  <span className="capitalize">{s}</span>
                </button>
              ))}
            </div>
          )}

          {ALLOWED.length > 0 && (
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DeliveriesPage = () => {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [selected, setSelected] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      const res = await api.get('/orders', { params })
      setOrders(res.data.orders)
    } catch {
      toast.error('Failed to load deliveries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [filter])

  const pending   = orders.filter((o) => ['confirmed', 'dispatched'].includes(o.status)).length
  const delivered = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{orders.length}</p>
            <p className="text-xs text-slate-500">Total Assigned</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{pending}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <CheckCircle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{delivered}</p>
            <p className="text-xs text-slate-500">Delivered</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'confirmed', 'dispatched', 'delivered'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Delivery cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-slate-400">
          <Truck size={36} className="mb-2 opacity-40" />
          <p>No deliveries assigned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id}
              className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-indigo-600 font-semibold">{order.orderNumber}</span>
                  <span className={`badge capitalize ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">{order.retailer?.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={12} />
                  <span className="truncate">{order.deliveryAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-slate-800">${order.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{order.items?.length} item(s)</p>
                </div>
                {['confirmed', 'dispatched'].includes(order.status) && (
                  <button
                    onClick={() => setSelected(order)}
                    className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Truck size={14} />
                    Update
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <UpdateStatusModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  )
}

export default DeliveriesPage
