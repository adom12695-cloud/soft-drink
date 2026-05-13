import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Search, Plus, Pencil, Trash2, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['cola', 'juice', 'water', 'energy_drink', 'sparkling', 'other']

const EMPTY_FORM = {
  name: '', brand: '', category: 'other', sku: '',
  description: '', pricePerUnit: '', unitSize: '', lowStockThreshold: 50,
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState(product ? { ...product } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const isEdit = !!product

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        const res = await api.put(`/products/${product._id}`, form)
        onSaved(res.data.product, 'update')
        toast.success('Product updated.')
      } else {
        const res = await api.post('/products', form)
        onSaved(res.data.product, 'create')
        toast.success('Product created.')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="input-field" placeholder="e.g. Coca-Cola Classic" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="input-field" placeholder="e.g. Coca-Cola" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange}
                className="input-field" placeholder="e.g. CC-500ML" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Size</label>
              <input name="unitSize" value={form.unitSize} onChange={handleChange}
                className="input-field" placeholder="e.g. 500ml" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price per Unit (ETB)</label>
              <input name="pricePerUnit" type="number" min="0" step="0.01"
                value={form.pricePerUnit} onChange={handleChange}
                className="input-field" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
              <input name="lowStockThreshold" type="number" min="0"
                value={form.lowStockThreshold} onChange={handleChange} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="input-field resize-none" rows={2} placeholder="Optional description…" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
          {!isEdit && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 text-center">
              New products are sent to the Warehouse Manager for physical count and approval before going live.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const { isDistributor } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [modal, setModal]       = useState(null) // null | 'create' | product object

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category) params.category = category
      if (search)   params.search   = search
      const res = await api.get('/products', { params })
      setProducts(res.data.products)
    } catch {
      toast.error('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [category])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const handleSaved = (saved, type) => {
    if (type === 'create') {
      setProducts((prev) => [saved, ...prev])
    } else {
      setProducts((prev) => prev.map((p) => p._id === saved._id ? saved : p))
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/products/${id}`)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast.success('Product deleted.')
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-auto">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c.replace('_', ' ')}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        {isDistributor && (
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-slate-400">
          <Package size={40} className="mb-3 opacity-40" />
          <p className="font-medium">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="card hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{product.brand} · {product.unitSize}</p>
                </div>
                <span className="badge bg-slate-100 text-slate-600 capitalize">
                  {product.category.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-500">{product.sku}</span>
                <span className="text-lg font-bold text-indigo-600">
                  ETB {Number(product.pricePerUnit).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-slate-500">Stock: </span>
                  <span className={`font-semibold ${product.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                    {product.stockQuantity} units
                  </span>
                  {product.isLowStock && (
                    <span className="ml-2 badge bg-red-100 text-red-600">Low</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {product.approvalStatus === 'pending_approval' && (
                    <span className="badge bg-amber-100 text-amber-700">Pending</span>
                  )}
                  {product.approvalStatus === 'rejected' && (
                    <span className="badge bg-red-100 text-red-600">Rejected</span>
                  )}
                  <span className={`badge ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {isDistributor && (
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setModal(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 rounded-lg
                               text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 rounded-lg
                               text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

export default ProductsPage
