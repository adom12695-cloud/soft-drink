import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { DollarSign, ShoppingCart, CheckCircle, Clock, XCircle, Truck } from 'lucide-react'

const STATUS_COLORS = {
  pending:    'bg-amber-400',
  confirmed:  'bg-blue-400',
  dispatched: 'bg-indigo-400',
  delivered:  'bg-emerald-400',
  cancelled:  'bg-red-400',
}

const STATUS_ICONS = {
  pending:    Clock,
  confirmed:  ShoppingCart,
  dispatched: Truck,
  delivered:  CheckCircle,
  cancelled:  XCircle,
}

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
)

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/orders/analytics')
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getCount = (status) =>
    analytics?.ordersByStatus?.find((s) => s._id === status)?.count ?? 0

  const totalNonCancelled = analytics?.ordersByStatus
    ?.filter((s) => s._id !== 'cancelled')
    .reduce((sum, s) => sum + s.count, 0) || 1

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders"   value={loading ? '…' : analytics?.totalOrders ?? 0}
          icon={ShoppingCart} colorClass="bg-indigo-500" />
        <StatCard label="Total Revenue"  value={loading ? '…' : `$${(analytics?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign} colorClass="bg-emerald-500" />
        <StatCard label="Delivered"      value={loading ? '…' : getCount('delivered')}
          icon={CheckCircle} colorClass="bg-blue-500" />
        <StatCard label="Cancelled"      value={loading ? '…' : getCount('cancelled')}
          icon={XCircle} colorClass="bg-red-400" />
      </div>

      {/* Order status breakdown */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-5">Order Status Breakdown</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((status) => {
              const count = getCount(status)
              const pct = Math.round((count / totalNonCancelled) * 100)
              const Icon = STATUS_ICONS[status]
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 capitalize">
                      <Icon size={14} />
                      {status}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${STATUS_COLORS[status]}`}
                      style={{ width: `${status === 'cancelled' ? 0 : pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent orders table */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : analytics?.recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Retailer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 text-slate-700">{order.retailer?.name ?? '—'}</td>
                    <td className="py-3 font-medium">${order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`badge capitalize ${STATUS_COLORS[order.status]?.replace('bg-', 'bg-').replace('-400', '-100')} text-slate-700`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No orders yet.</p>
        )}
      </div>
    </div>
  )
}

export default AnalyticsPage
