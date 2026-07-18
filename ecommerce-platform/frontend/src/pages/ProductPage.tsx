import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Star, Truck, Shield } from 'lucide-react'
import { productService } from '../services/product.service'
import { cartService } from '../services/cart.service'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (id) loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const res = await productService.getById(id!)
      setProduct(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar al carrito')
      return
    }
    try {
      await cartService.addItem(product!.id, quantity)
      alert(`${quantity} x ${product!.name} agregado al carrito`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al agregar al carrito')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Producto no encontrado</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Volver a productos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={18} />
        Volver a productos
      </Link>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Imagen */}
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-6xl">📦</div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="text-sm text-blue-600 font-medium mb-2">
              {product.category}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} className="text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-sm text-gray-500 ml-2">(128 reseñas)</span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="text-4xl font-bold text-gray-900 mb-6">
              ${product.price}
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                En stock ({product.stock} disponibles)
              </div>
            ) : (
              <div className="text-red-600 mb-6 font-medium">
                Agotado temporalmente
              </div>
            )}

            {/* Cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-700 font-medium">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Agregar al carrito
            </button>

            {/* Beneficios */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={18} className="text-blue-600" />
                Envío gratis
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={18} className="text-blue-600" />
                Garantía 30 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
