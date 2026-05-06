import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { ArrowDownCircle, ArrowUpCircle, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Stock Action Modal ───────────────────────────────────────────────────────
const StockModal = ({ type, products, onClose, onDone }) => {
  const [form, setForm] = useState({ productId: '', quantity: '', reason: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const endpoint = type === 'in' ? '/stock/in' : '/stock/out'
      const res = await api.post(endpoint, form)
      toast.success(res.data.message)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock operation failed.')
    } finally {
      setSaving(false)
    }
  }

  const isIn = type === 'in'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className={`px-6 py-4 rounded-t-2xl flex items-center gap-3 ${isIn ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isIn
            ? <ArrowDownCircle size={22} className="text-emerald-600" />
            : <ArrowUpCircle size={22} className="text-red-500" />}
          <h2 className={`font-semibold ${isIn ? 'text-emerald-800' : 'text-red-800'}`}>
            {isIn ? 'Stock In — Add Inventory' : 'Stock Out — Remove Inventory'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — {p.stockQuantity} in stock
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="input-field"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="input-field"
              placeholder={isIn ? 'e.g. New shipment received' : 'e.g. Damaged goods'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors text-white
                ${isIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {saving ? 'Processing…' : isIn ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const StockPage = () => {
  const [products, setProducts] = useState([])
  const [logs, setLogs]         = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading]   = useState(true)
  const [logsLoading, setLogsLoading] = useState(true)
  const [modal, setModal]       = useState(null) // null | 'in' | 'out'
  const [logFilter, setLogFilter] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [prodRes, lowRes] = await Promise.all([
        api.get('/products'),
        api.get('/stock/low'),
      ])
      setProducts(prodRes.data.products)
      setLowStock(lowRes.data.products)
    } catch {
      toast.error('Failed to load stock data.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const params = {}
      if (logFilter) params.type = logFilter
      const res = await api.get('/stock/logs', { params })
      setLogs(res.data.logs)
    } catch {
      toast.error('Failed to load stock logs.')
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => { fetchAll(); fetchLogs() }, [])
  useEffect(() => { fetchLogs() }, [logFilter])

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setModal('in')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white
                     font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowDownCircle size={18} /> Stock In
        </button>
        <button
          onClick={() => setModal('out')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white
                     font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowUpCircle size={18} /> Stock Out
        </button>
      </div>

      {/* Low stock alert */}
      {!loading && lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {lowStock.length} product{lowStock.length > 1 ? 's are' : ' is'} running low on stock
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              {lowStock.map((p) => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Products stock table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-700">Current Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Threshold</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{p.sku}</td>
                  <td className="px-6 py-4 capitalize text-slate-500">{p.category.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${p.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{p.lowStockThreshold}</td>
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

      {/* Stock logs */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Stock Movement Log</h2>
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="">All Movements</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Qty</th>
                <th className="px-6 py-3 font-medium">Before → After</th>
                <th className="px-6 py-3 font-medium">By</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{log.product?.name}</td>
                  <td className="px-6 py-4">
                    {log.type === 'stock_in'
                      ? <span className="badge bg-emerald-100 text-emerald-700">Stock In</span>
                      : <span className="badge bg-red-100 text-red-600">Stock Out</span>}
                  </td>
                  <td className="px-6 py-4 font-semibold">{log.quantity}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {log.previousStock} → {log.newStock}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.performedBy?.name}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-[140px] truncate">{log.reason || '—'}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <StockModal
          type={modal}
          products={products}
          onClose={() => setModal(null)}
          onDone={() => { fetchAll(); fetchLogs() }}
        />
      )}
    </div>
  )
}

export default StockPage
