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
  const [analytics, setAnalytics]       = useState(null)
  const [pendingReports, setPendingReports] = useState(0)
  const [pendingProducts, setPendingProducts] = useState(0)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/orders/analytics'),
      api.get('/reports', { params: { status: 'pending' } }),
      api.get('/products/pending-approval'),
    ])
      .then(([analyticsRes, reportsRes, productsRes]) => {
        setAnalytics(analyticsRes.data.analytics)
        setPendingReports(reportsRes.data.count)
        setPendingProducts(productsRes.data.count)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getStatusCount = (status) =>
    analytics?.ordersByStatus?.find((s) => s._id === status)?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders"
          value={loading ? '…' : analytics?.totalOrders ?? 0}
          icon={ShoppingCart} colorClass="bg-indigo-500" />
        <StatCard label="Total Revenue (ETB)"
          value={loading ? '…' : `ETB ${(analytics?.totalRevenue ?? 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`}
          icon={DollarSign} colorClass="bg-emerald-500" />
        <StatCard label="Delivered"
          value={loading ? '…' : getStatusCount('delivered')}
          icon={CheckCircle} colorClass="bg-blue-500" />
        <StatCard label="Pending Orders"
          value={loading ? '…' : getStatusCount('pending')}
          icon={AlertTriangle} colorClass="bg-amber-500" />
      </div>

      {/* Action banners */}
      {!loading && (pendingReports > 0 || pendingProducts > 0) && (
        <div className="space-y-2">
          {pendingReports > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 font-medium">
                  {pendingReports} warehouse report{pendingReports > 1 ? 's are' : ' is'} awaiting your approval
                </p>
              </div>
              <a href="/admin-reports"
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                Review
              </a>
            </div>
          )}
          {pendingProducts > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">
                  {pendingProducts} product{pendingProducts > 1 ? 's are' : ' is'} pending warehouse approval
                </p>
              </div>
              <a href="/products/manage"
                className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                View
              </a>
            </div>
          )}
        </div>
      )}

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
                  <th className="pb-3 font-medium">Amount (ETB)</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono text-indigo-600">{order.orderNumber}</td>
                    <td className="py-3 text-slate-700">{order.retailer?.name ?? '—'}</td>
                    <td className="py-3 font-medium">
                      ETB {Number(order.totalAmount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </td>
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
  const [lowStock, setLowStock]       = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/stock/low'),
      api.get('/products/pending-approval'),
      api.get('/products'),
    ])
      .then(([lowRes, pendingRes, prodRes]) => {
        setLowStock(lowRes.data.products)
        setPendingCount(pendingRes.data.count)
        setTotalProducts(prodRes.data.count)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Low Stock Alerts"    value={loading ? '…' : lowStock.length}
          icon={AlertTriangle} colorClass="bg-amber-500" />
        <StatCard label="Pending Approvals"   value={loading ? '…' : pendingCount}
          icon={TrendingUp} colorClass={pendingCount > 0 ? 'bg-orange-500' : 'bg-indigo-500'}
          sub={pendingCount > 0 ? 'Needs your attention' : undefined} />
        <StatCard label="Total Products"      value={loading ? '…' : totalProducts}
          icon={Package} colorClass="bg-blue-500" />
      </div>

      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                {pendingCount} product{pendingCount > 1 ? 's are' : ' is'} waiting for your count & approval
              </p>
              <p className="text-orange-600 text-xs mt-0.5">
                Admin has added new items. Please count the physical stock and approve them.
              </p>
            </div>
          </div>
          <a href="/warehouse/approvals"
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            Review Now
          </a>
        </div>
      )}

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
        <StatCard label="Total Spent"     value={loading ? '…' : `ETB ${totalSpent.toLocaleString('en-ET', { minimumFractionDigits: 2 })}`}
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
                    <td className="py-3 font-medium">
                      ETB {Number(order.totalAmount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                    </td>
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
