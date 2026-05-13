import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { CheckCircle, XCircle, Package, ClipboardCheck, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Approve Modal ────────────────────────────────────────────────────────────
const ApproveModal = ({ product, onClose, onDone }) => {
  const [physicalCount, setPhysicalCount] = useState(product.stockQuantity || 0)
  const [note, setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleApprove = async () => {
    if (physicalCount < 0) { toast.error('Count cannot be negative.'); return }
    setSaving(true)
    try {
      await api.patch(`/products/${product._id}/approve`, { physicalCount, note })
      toast.success(`"${product.name}" approved and is now live.`)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 bg-emerald-50 rounded-t-2xl flex items-center gap-3">
          <ClipboardCheck size={22} className="text-emerald-600" />
          <h2 className="font-semibold text-emerald-800">Count & Approve Product</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="font-semibold text-slate-800">{product.name}</p>
            <p className="text-sm text-slate-500">{product.brand} · {product.unitSize} · {product.sku}</p>
            <p className="text-sm text-slate-500 capitalize">{product.category.replace('_', ' ')}</p>
            <p className="text-sm font-semibold text-indigo-600 mt-1">
              ETB {Number(product.pricePerUnit).toLocaleString('en-ET', { minimumFractionDigits: 2 })} / unit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Physical Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={physicalCount}
              onChange={(e) => setPhysicalCount(Number(e.target.value))}
              className="input-field"
              placeholder="Enter actual units counted in warehouse"
            />
            <p className="text-xs text-slate-400 mt-1">
              Count the physical units in the warehouse and enter the exact number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              rows={2}
              placeholder="e.g. Counted and verified. All units in good condition."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleApprove}
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {saving ? 'Approving…' : 'Approve & Make Live'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ product, onClose, onDone }) => {
  const [note, setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleReject = async () => {
    setSaving(true)
    try {
      await api.patch(`/products/${product._id}/reject`, { note })
      toast.success(`"${product.name}" rejected.`)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 bg-red-50 rounded-t-2xl flex items-center gap-3">
          <XCircle size={22} className="text-red-500" />
          <h2 className="font-semibold text-red-800">Reject Product</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-800">{product.name}</p>
            <p className="text-sm text-slate-500">{product.sku}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason for Rejection <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="e.g. Product not found in warehouse. Incorrect SKU."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleReject}
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {saving ? 'Rejecting…' : 'Reject Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const WarehouseApprovalsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [approveModal, setApproveModal] = useState(null)
  const [rejectModal, setRejectModal]   = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await api.get('/products/pending-approval')
      setProducts(res.data.products)
    } catch {
      toast.error('Failed to load pending products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Product Approvals</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Count physical stock and approve new products added by the admin.
          </p>
        </div>
        <span className="badge bg-amber-100 text-amber-700 text-sm px-3 py-1.5">
          {products.length} Pending
        </span>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          When the admin adds a new product, it is <strong>not visible to retailers</strong> until you physically count the units in the warehouse and approve it. Rejected products are sent back to the admin for review.
        </p>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-slate-400">
          <CheckCircle size={44} className="mb-3 text-emerald-400" />
          <p className="font-semibold text-slate-600">All caught up!</p>
          <p className="text-sm mt-1">No products are waiting for your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="card flex flex-col gap-3 border-l-4 border-amber-400">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{product.brand} · {product.unitSize}</p>
                </div>
                <span className="badge bg-amber-100 text-amber-700 capitalize">
                  {product.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-500">{product.sku}</span>
                <span className="text-base font-bold text-indigo-600">
                  ETB {Number(product.pricePerUnit).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {product.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
              )}

              <div className="text-xs text-slate-400">
                Added {new Date(product.createdAt).toLocaleDateString('en-ET', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </div>

              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setApproveModal(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg
                             bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => setRejectModal(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg
                             bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {approveModal && (
        <ApproveModal
          product={approveModal}
          onClose={() => setApproveModal(null)}
          onDone={fetchPending}
        />
      )}
      {rejectModal && (
        <RejectModal
          product={rejectModal}
          onClose={() => setRejectModal(null)}
          onDone={fetchPending}
        />
      )}
    </div>
  )
}

export default WarehouseApprovalsPage
