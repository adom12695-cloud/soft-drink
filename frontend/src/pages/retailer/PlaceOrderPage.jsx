import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const PlaceOrderPage = () => {
  const navigate = useNavigate()
  const [products, setProducts]   = useState([])
  const [cart, setCart]           = useState([])   // [{ product, quantity }]
  const [address, setAddress]     = useState('')
  const [notes, setNotes]         = useState('')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/products', { params: { isActive: true } })
      .then((res) => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product._id === product._id)
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stockQuantity) }
            : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => i.product._id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0),
    )
  }

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((i) => i.product._id !== productId))

  const cartTotal = cart.reduce((sum, i) => sum + i.product.pricePerUnit * i.quantity, 0)

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cart.length === 0) { toast.error('Add at least one item to your order.'); return }
    if (!address.trim())   { toast.error('Delivery address is required.'); return }

    setSubmitting(true)
    try {
      await api.post('/orders', {
        items: cart.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        deliveryAddress: address,
        notes,
      })
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* ── Product catalog ── */}
      <div className="xl:col-span-2 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-4"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-32 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-slate-400">
            <Package size={36} className="mb-2 opacity-40" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((product) => {
              const inCart = cart.find((i) => i.product._id === product._id)
              const outOfStock = product.stockQuantity === 0
              return (
                <div key={product._id}
                  className={`card flex flex-col gap-2 transition-shadow hover:shadow-md
                    ${outOfStock ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.brand} · {product.unitSize}</p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">${product.pricePerUnit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${product.isLowStock ? 'text-amber-600' : 'text-slate-500'}`}>
                      {outOfStock ? 'Out of stock' : `${product.stockQuantity} available`}
                    </span>
                    {!outOfStock && (
                      inCart ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(product._id, -1)}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="font-semibold w-5 text-center">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQty(product._id, 1)}
                            disabled={inCart.quantity >= product.stockQuantity}
                            className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-40">
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)}
                          className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700
                                     text-white px-3 py-1.5 rounded-lg transition-colors">
                          <Plus size={14} /> Add
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Cart & checkout ── */}
      <div className="space-y-4">
        <div className="card sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-800">Your Order</h2>
            {cart.length > 0 && (
              <span className="ml-auto badge bg-indigo-100 text-indigo-700">{cart.length} item(s)</span>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">
              Add products from the catalog to get started.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-slate-400 text-xs">${item.product.pricePerUnit} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-700 whitespace-nowrap">
                    ${(item.product.pricePerUnit * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(item.product._id)}
                    className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span className="text-indigo-600">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Enter delivery address…"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                placeholder="Any special instructions…"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing order…
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Place Order · ${cartTotal.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrderPage
