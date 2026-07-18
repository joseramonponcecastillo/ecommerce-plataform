import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react'
import { cartService } from '../services/cart.service'
import { orderService } from '../services/order.service'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string
    stock: number
  }
}

interface Cart {
  items: CartItem[]
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const res = await cartService.getCart()
      setCart(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return
    try {
      await cartService.updateItem(itemId, newQty)
      loadCart()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar')
    }
  }

  const removeItem = async (itemId: string) => {
    if (!confirm('¿Eliminar este producto del carrito?')) return
    try {
      await cartService.removeItem(itemId)
      loadCart()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCheckout = async () => {
    if (!cart?.items.length) return
    setCheckoutLoading(true)

    try {
      const items = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))

      const res = await orderService.checkout(items)
      alert(`¡Compra exitosa! Orden: ${res.data.order.orderNumber}`)
      navigate('/orders')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar la compra')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const total = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cart?.items.length) {
    return (
      <div className="text-center py-16">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-6">
          Explora nuestros productos y encuentra algo que te guste
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu carrito</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>

              <div className="flex-1">
                <Link
                  to={`/product/${item.product.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-500 text-sm mt-1">
                  ${item.product.price} c/u
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            {checkoutLoading ? 'Procesando...' : 'Pagar ahora'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Pago seguro simulado (Stripe en modo demo)
          </p>
        </div>
      </div>
    </div>
  )
}
