import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Package, ShoppingCart, Truck, Users,
  TrendingUp, AlertTriangle, DollarSign, CheckCircle,
} from 'lucide-react'

// ─── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, colorClass, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-800 truncate">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
}

const StatusBadge = ({ status }) => (
  <span className={`badge capitalize ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
)

// ─── Distributor Dashboard ────────────────────────────────────────────────────
const DistributorDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/analytics')
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getStatusCount = (status) =>
    analytics?.ordersByStatus?.find((s) => s._id === status)?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders"   value={loading ? '…' : analytics?.totalOrders ?? 0}
          icon={ShoppingCart} colorClass="bg-indigo-500" />
        <StatCard label="Total Revenue"  value={loading ? '…' : `$${(analytics?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign} colorClass="bg-emerald-500" />
        <StatCard label="Delivered"      value={loading ? '…' : getStatusCount('delivered')}
          icon={CheckCircle} colorClass="bg-blue-500" />
        <StatCard label="Pending Orders" value={loading ? '…' : getStatusCount('pending')}
          icon={AlertTriangle} colorClass="bg-amber-500" />
      </div>

      {/* Recent orders */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 text-slate-700">{order.retailer?.name ?? '—'}</td>
                    <td className="py-3 font-medium">${order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
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

// ─── Warehouse Dashboard ──────────────────────────────────────────────────────
const WarehouseDashboard = () => {
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stock/low')
      .then((res) => setLowStock(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Low Stock Alerts" value={loading ? '…' : lowStock.length}
          icon={AlertTriangle} colorClass="bg-amber-500" />
        <StatCard label="Stock Movements" value="—" icon={TrendingUp} colorClass="bg-indigo-500" />
        <StatCard label="Total Products"  value="—" icon={Package}    colorClass="bg-blue-500" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Low Stock Products
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : lowStock.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lowStock.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="py-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-3">
                      <span className="text-red-600 font-semibold">{p.stockQuantity}</span>
                    </td>
                    <td className="py-3 text-slate-500">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">All products are well stocked. ✅</p>
        )}
      </div>
    </div>
  )
}

// ─── Retailer Dashboard ───────────────────────────────────────────────────────
const RetailerDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending   = orders.filter((o) => ['pending', 'confirmed', 'dispatched'].includes(o.status)).length
  const delivered = orders.filter((o) => o.status === 'delivered').length
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Orders"    value={loading ? '…' : orders.length}
          icon={ShoppingCart} colorClass="bg-indigo-500" />
        <StatCard label="Pending Delivery" value={loading ? '…' : pending}
          icon={Truck} colorClass="bg-amber-500" />
        <StatCard label="Total Spent"     value={loading ? '…' : `$${totalSpent.toLocaleString()}`}
          icon={DollarSign} colorClass="bg-emerald-500" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 text-slate-600">{order.items?.length} item(s)</td>
                    <td className="py-3 font-medium">${order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No orders yet. Place your first order!</p>
        )}
      </div>
    </div>
  )
}

// ─── Delivery Dashboard ───────────────────────────────────────────────────────
const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending   = orders.filter((o) => o.status === 'dispatched').length
  const delivered = orders.filter((o) => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Assigned Orders" value={loading ? '…' : orders.length}
          icon={Truck} colorClass="bg-indigo-500" />
        <StatCard label="Delivered"       value={loading ? '…' : delivered}
          icon={CheckCircle} colorClass="bg-emerald-500" />
        <StatCard label="In Transit"      value={loading ? '…' : pending}
          icon={AlertTriangle} colorClass="bg-amber-500" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Assigned Deliveries</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Retailer</th>
                  <th className="pb-3 font-medium">Address</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 text-slate-700">{order.retailer?.name ?? '—'}</td>
                    <td className="py-3 text-slate-500 max-w-[180px] truncate">{order.deliveryAddress}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No deliveries assigned yet.</p>
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, role } = useAuth()

  const dashboards = {
    distributor:        <DistributorDashboard />,
    warehouse_manager:  <WarehouseDashboard />,
    retailer:           <RetailerDashboard />,
    delivery_personnel: <DeliveryDashboard />,
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening in your distribution network today.
        </p>
      </div>
      {dashboards[role] ?? <p className="text-slate-500">No dashboard available for your role.</p>}
    </div>
  )
}

export default DashboardPage
