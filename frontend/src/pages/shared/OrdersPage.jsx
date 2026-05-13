import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Eye, UserCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onAssign, isDistributor }) => {
  const [deliveryUsers, setDeliveryUsers] = useState([])
  const [selectedPersonnel, setSelectedPersonnel] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (isDistributor) {
      api.get('/users', { params: { role: 'delivery_personnel' } })
        .then((res) => setDeliveryUsers(res.data.users))
        .catch(() => {})
    }
  }, [isDistributor])

  const handleAssign = async () => {
    if (!selectedPersonnel) { toast.error('Select a delivery person.'); return }
    setAssigning(true)
    try {
      await api.patch(`/orders/${order._id}/assign`, { deliveryPersonnelId: selectedPersonnel })
      toast.success('Delivery assigned.')
      onAssign()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign delivery.')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-slate-800">Order Details</h2>
            <p className="text-xs text-indigo-600 font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + meta */}
          <div className="flex items-center justify-between">
            <span className={`badge capitalize ${STATUS_STYLES[order.status]}`}>{order.status}</span>
            <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          {/* Retailer */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Retailer</p>
            <p className="text-sm font-medium text-slate-800">{order.retailer?.name}</p>
            <p className="text-xs text-slate-400">{order.retailer?.email}</p>
          </div>

          {/* Delivery address */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Delivery Address</p>
            <p className="text-sm text-slate-700">{order.deliveryAddress}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Items</p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-800">{item.product?.name}</p>
                    <p className="text-xs text-slate-400">{item.product?.sku} · {item.product?.unitSize}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ETB {(item.priceAtOrder * item.quantity).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400">
                      ×{item.quantity} @ ETB {Number(item.priceAtOrder).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-3">
            <span>Total</span>
            <span className="text-indigo-600">
              ETB {Number(order.totalAmount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Assign delivery (distributor only, pending/confirmed orders) */}
          {isDistributor && ['pending', 'confirmed'].includes(order.status) && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assign Delivery</p>
              <select
                value={selectedPersonnel}
                onChange={(e) => setSelectedPersonnel(e.target.value)}
                className="input-field"
              >
                <option value="">Select delivery personnel…</option>
                {deliveryUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} — {u.phone || u.email}</option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <UserCheck size={16} />
                {assigning ? 'Assigning…' : 'Assign & Confirm'}
              </button>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-slate-600 italic">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const { isDistributor } = useAuth()
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/orders', { params })
      setOrders(res.data.orders)
    } catch {
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        {['', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Order #</th>
                {isDistributor && <th className="px-6 py-3 font-medium">Retailer</th>}
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(isDistributor ? 7 : 6)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={isDistributor ? 7 : 6} className="px-6 py-10 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-indigo-600">{order.orderNumber}</td>
                    {isDistributor && (
                      <td className="px-6 py-4 text-slate-700">{order.retailer?.name}</td>
                    )}
                    <td className="px-6 py-4 text-slate-500">{order.items?.length} item(s)</td>
                  <td className="px-6 py-4 font-semibold">
                    ETB {Number(order.totalAmount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                  </td>
                    <td className="px-6 py-4">
                      <span className={`badge capitalize ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelected(order)}
                        className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          isDistributor={isDistributor}
          onClose={() => setSelected(null)}
          onAssign={fetchOrders}
        />
      )}
    </div>
  )
}

export default OrdersPage
