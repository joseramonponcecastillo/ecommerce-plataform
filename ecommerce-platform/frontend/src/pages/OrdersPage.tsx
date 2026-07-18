import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { orderService } from '../services/order.service'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  PAID: { label: 'Pagado', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  SHIPPED: { label: 'Enviado', color: 'text-blue-600 bg-blue-50', icon: Truck },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await orderService.getOrders()
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No tienes órdenes aún
        </h2>
        <p className="text-gray-500 mb-6">
          Cuando compres algo, aparecerá aquí
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Explorar productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis compras</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.PENDING
          const StatusIcon = config.icon

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* Header de orden */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Orden</span>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.color}`}>
                  <StatusIcon size={16} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.unitPrice}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Total: </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
