import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { FileText, Plus, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatETB = (n) =>
  `ETB ${Number(n).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
}
const STATUS_ICONS = {
  pending:  Clock,
  approved: CheckCircle,
  rejected: XCircle,
}

// ─── Submit Report Modal ──────────────────────────────────────────────────────
const SubmitReportModal = ({ onClose, onDone }) => {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    type: 'daily',
    periodStart: today,
    periodEnd:   today,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (type) => {
    if (type === 'weekly') {
      const end   = new Date()
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      setForm({
        ...form,
        type,
        periodStart: start.toISOString().split('T')[0],
        periodEnd:   end.toISOString().split('T')[0],
      })
    } else {
      setForm({ ...form, type, periodStart: today, periodEnd: today })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/reports', form)
      toast.success('Report submitted successfully.')
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 bg-indigo-50 rounded-t-2xl flex items-center gap-3">
          <FileText size={22} className="text-indigo-600" />
          <h2 className="font-semibold text-indigo-800">Submit Warehouse Report</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
            <div className="flex gap-3">
              {['daily', 'weekly'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize
                    ${form.type === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period Start</label>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period End</label>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Any observations, issues, or remarks for this period…"
            />
          </div>

          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
            The report will automatically include all stock movements and sales data for the selected period.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Report Detail Row ────────────────────────────────────────────────────────
const ReportRow = ({ report }) => {
  const [expanded, setExpanded] = useState(false)
  const Icon = STATUS_ICONS[report.status]

  return (
    <>
      <tr
        className="hover:bg-slate-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4 font-mono text-indigo-600 text-sm">{report.reportNumber}</td>
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
        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
          {formatETB(report.totalRevenueETB)}
        </td>
        <td className="px-6 py-4 text-sm text-slate-500">{report.totalUnitsSold}</td>
        <td className="px-6 py-4">
          <span className={`badge flex items-center gap-1 w-fit ${STATUS_STYLES[report.status]}`}>
            <Icon size={12} />
            <span className="capitalize">{report.status}</span>
          </span>
        </td>
        <td className="px-6 py-4 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                      <td className="px-4 py-2 font-semibold text-slate-800">
                        {formatETB(item.revenueETB)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {report.notes && (
              <p className="mt-3 text-sm text-slate-500 italic">
                <span className="font-medium text-slate-600">Notes:</span> {report.notes}
              </p>
            )}
            {report.reviewNote && (
              <p className="mt-2 text-sm text-slate-500 italic">
                <span className="font-medium text-slate-600">Admin note:</span> {report.reviewNote}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter]     = useState({ type: '', status: '' })

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter.type)   params.type   = filter.type
      if (filter.status) params.status = filter.status
      const res = await api.get('/reports', { params })
      setReports(res.data.reports)
    } catch {
      toast.error('Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [filter])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Warehouse Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Submit daily and weekly reports to the admin.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} /> Submit Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Report #</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Revenue</th>
                <th className="px-6 py-3 font-medium">Units Sold</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium"></th>
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
                reports.map((report) => <ReportRow key={report._id} report={report} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <SubmitReportModal
          onClose={() => setShowModal(false)}
          onDone={fetchReports}
        />
      )}
    </div>
  )
}

export default ReportsPage
