import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import {
  BarChart3, Package, TrendingUp, DollarSign,
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  AlertTriangle, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatETB = (n) =>
  `ETB ${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, colorClass, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold text-slate-800 truncate">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Review Modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ report, action, onClose, onDone }) => {
  const [reviewNote, setReviewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const isApprove = action === 'approve'

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await api.patch(`/reports/${report._id}/${action}`, { reviewNote })
      toast.success(`Report ${isApprove ? 'approved' : 'rejected'}.`)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className={`px-6 py-4 rounded-t-2xl flex items-center gap-3 ${isApprove ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isApprove
            ? <CheckCircle size={22} className="text-emerald-600" />
            : <XCircle size={22} className="text-red-500" />}
          <h2 className={`font-semibold ${isApprove ? 'text-emerald-800' : 'text-red-800'}`}>
            {isApprove ? 'Approve Report' : 'Reject Report'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="font-semibold text-slate-800">{report.reportNumber}</p>
            <p className="text-sm text-slate-500 capitalize">{report.type} report</p>
            <p className="text-sm text-slate-500">
              {new Date(report.periodStart).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}
              {' – '}
              {new Date(report.periodEnd).toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-sm font-semibold text-indigo-600">
              Revenue: {formatETB(report.totalRevenueETB)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder={isApprove ? 'e.g. Verified and approved.' : 'e.g. Numbers do not match. Please resubmit.'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors
                ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {saving ? 'Processing…' : isApprove ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Report Row ───────────────────────────────────────────────────────────────
const ReportRow = ({ report, onAction }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 font-mono text-indigo-600 text-sm">{report.reportNumber}</td>
        <td className="px-6 py-4 text-sm text-slate-700">{report.submittedBy?.name ?? '—'}</td>
        <td className="px-6 py-4">
          <span className={`badge capitalize ${report.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {report.type}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {new Date(report.periodStart).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' })}
          {' – '}
          {new Date(report.periodEnd).toLocaleDateString('en-ET', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{formatETB(report.totalRevenueETB)}</td>
        <td className="px-6 py-4">
          <span className={`badge capitalize ${STATUS_STYLES[report.status]}`}>{report.status}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {report.status === 'pending' && (
              <>
                <button
                  onClick={() => onAction(report, 'approve')}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  title="Approve"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => onAction(report, 'reject')}
                  className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Reject"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              title="Details"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="px-6 pb-4 bg-slate-50">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Opening</th>
                    <th className="px-4 py-2 font-medium">Stock In</th>
                    <th className="px-4 py-2 font-medium">Stock Out</th>
                    <th className="px-4 py-2 font-medium">Sold</th>
                    <th className="px-4 py-2 font-medium">Closing</th>
                    <th className="px-4 py-2 font-medium">Revenue (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {item.product?.name ?? '—'}
                        <span className="ml-1 text-xs text-slate-400">{item.product?.sku}</span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{item.openingStock}</td>
                      <td className="px-4 py-2 text-emerald-600 font-medium">+{item.stockIn}</td>
                      <td className="px-4 py-2 text-red-500 font-medium">-{item.stockOut}</td>
                      <td className="px-4 py-2 text-indigo-600 font-semibold">{item.unitsSold}</td>
                      <td className="px-4 py-2 text-slate-600">{item.closingStock}</td>
                      <td className="px-4 py-2 font-semibold">{formatETB(item.revenueETB)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.notes && (
              <p className="mt-3 text-sm text-slate-500 italic">
                <span className="font-medium text-slate-600">Warehouse note:</span> {report.notes}
              </p>
            )}
            {report.reviewNote && (
              <p className="mt-2 text-sm text-slate-500 italic">
                <span className="font-medium text-slate-600">Your note:</span> {report.reviewNote}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminReportsPage = () => {
  const [tab, setTab] = useState('reports') // 'reports' | 'sales' | 'stock'
  const [reports, setReports]       = useState([])
  const [salesSummary, setSalesSummary] = useState(null)
  const [stockSummary, setStockSummary] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [reviewModal, setReviewModal] = useState(null) // { report, action }
  const [dateRange, setDateRange]   = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  })

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports')
      setReports(res.data.reports)
    } catch { toast.error('Failed to load reports.') }
    finally { setLoading(false) }
  }

  const fetchSales = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/sales-summary', { params: dateRange })
      setSalesSummary(res.data.summary)
    } catch { toast.error('Failed to load sales summary.') }
    finally { setLoading(false) }
  }

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/stock-summary')
      setStockSummary(res.data.summary)
    } catch { toast.error('Failed to load stock summary.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (tab === 'reports') fetchReports()
    else if (tab === 'sales') fetchSales()
    else if (tab === 'stock') fetchStock()
  }, [tab])

  const pendingCount = reports.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review warehouse reports, sales performance, and stock status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'reports', label: 'Warehouse Reports', icon: FileText },
          { key: 'sales',   label: 'Sales Report',      icon: TrendingUp },
          { key: 'stock',   label: 'Stock Report',       icon: Package },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon size={15} />
            {label}
            {key === 'reports' && pendingCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Warehouse Reports Tab ── */}
      {tab === 'reports' && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="px-6 py-3 font-medium">Report #</th>
                  <th className="px-6 py-3 font-medium">Submitted By</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Period</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <FileText size={36} className="mx-auto mb-3 opacity-30" />
                      <p>No reports submitted yet.</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <ReportRow
                      key={report._id}
                      report={report}
                      onAction={(r, action) => setReviewModal({ report: r, action })}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sales Report Tab ── */}
      {tab === 'sales' && (
        <div className="space-y-5">
          {/* Date range filter */}
          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="input-field"
              />
            </div>
            <button onClick={fetchSales} className="btn-primary">Apply</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-24 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : salesSummary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Total Revenue"
                  value={formatETB(salesSummary.totalRevenue)}
                  icon={DollarSign}
                  colorClass="bg-emerald-500"
                />
                <StatCard
                  label="Delivered Orders"
                  value={salesSummary.totalOrders}
                  icon={CheckCircle}
                  colorClass="bg-indigo-500"
                />
                <StatCard
                  label="Order Statuses"
                  value={salesSummary.ordersByStatus?.length ?? 0}
                  icon={BarChart3}
                  colorClass="bg-blue-500"
                />
              </div>

              {/* Top products */}
              <div className="card">
                <h3 className="font-semibold text-slate-700 mb-4">Top Products by Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">SKU</th>
                        <th className="pb-3 font-medium">Units Sold</th>
                        <th className="pb-3 font-medium">Revenue (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {salesSummary.productRevenue?.map((p, i) => (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="py-3 text-slate-400 font-medium">{i + 1}</td>
                          <td className="py-3 font-medium text-slate-800">{p.name}</td>
                          <td className="py-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="py-3 text-indigo-600 font-semibold">{p.unitsSold}</td>
                          <td className="py-3 font-bold text-emerald-700">{formatETB(p.revenueETB)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily revenue trend */}
              {salesSummary.dailyRevenue?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-700 mb-4">Daily Revenue Trend</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-100">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Orders</th>
                          <th className="pb-3 font-medium">Revenue (ETB)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {salesSummary.dailyRevenue.map((d) => (
                          <tr key={d._id} className="hover:bg-slate-50">
                            <td className="py-3 text-slate-600">{d._id}</td>
                            <td className="py-3 text-indigo-600 font-semibold">{d.orders}</td>
                            <td className="py-3 font-bold text-emerald-700">{formatETB(d.revenueETB)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── Stock Report Tab ── */}
      {tab === 'stock' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-24 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : stockSummary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Total Products"
                  value={stockSummary.totalProducts}
                  icon={Package}
                  colorClass="bg-indigo-500"
                />
                <StatCard
                  label="Low Stock Alerts"
                  value={stockSummary.lowStockCount}
                  icon={AlertTriangle}
                  colorClass="bg-amber-500"
                />
                <StatCard
                  label="Total Stock Value"
                  value={formatETB(stockSummary.totalStockValue)}
                  icon={DollarSign}
                  colorClass="bg-emerald-500"
                />
              </div>

              {/* Low stock alert */}
              {stockSummary.lowStock?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      {stockSummary.lowStock.length} product{stockSummary.lowStock.length > 1 ? 's are' : ' is'} below threshold
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      {stockSummary.lowStock.map((p) => p.name).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* All products stock table */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-700">Current Stock Levels</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-left text-slate-500">
                        <th className="px-6 py-3 font-medium">Product</th>
                        <th className="px-6 py-3 font-medium">SKU</th>
                        <th className="px-6 py-3 font-medium">Price (ETB)</th>
                        <th className="px-6 py-3 font-medium">Stock</th>
                        <th className="px-6 py-3 font-medium">Threshold</th>
                        <th className="px-6 py-3 font-medium">Stock Value (ETB)</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockSummary.products?.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{p.sku}</td>
                          <td className="px-6 py-4 font-semibold text-indigo-600">
                            {formatETB(p.pricePerUnit)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold ${p.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{p.lowStockThreshold}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {formatETB(p.stockQuantity * p.pricePerUnit)}
                          </td>
                          <td className="px-6 py-4">
                            {p.isLowStock
                              ? <span className="badge bg-red-100 text-red-600">Low Stock</span>
                              : <span className="badge bg-emerald-100 text-emerald-700">OK</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          report={reviewModal.report}
          action={reviewModal.action}
          onClose={() => setReviewModal(null)}
          onDone={fetchReports}
        />
      )}
    </div>
  )
}

export default AdminReportsPage
