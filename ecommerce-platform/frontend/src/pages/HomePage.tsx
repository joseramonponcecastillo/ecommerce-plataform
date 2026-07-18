import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, ShoppingCart, Star } from 'lucide-react'
import { productService } from '../services/product.service'
import { cartService } from '../services/cart.service'
import { useAuthStore } from '../store/authStore'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await productService.getAll()
      setProducts(res.data.products)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await productService.getCategories()
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar al carrito')
      return
    }
    try {
      await cartService.addItem(productId, 1)
      alert('Producto agregado al carrito')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al agregar al carrito')
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Bienvenido a MiTienda
        </h1>
        <p className="text-gray-600 text-lg">
          Encuentra los mejores productos al mejor precio
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar productos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Precio máximo */}
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio máximo: ${priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
          >
            <Link to={`/product/${product.id}`}>
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">📦</div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <div className="text-xs text-blue-600 font-medium mb-1">
                {product.category}
              </div>
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      ¡Solo {product.stock} left!
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="ml-2 text-xs text-red-600 font-medium">
                      Agotado
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Filter size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory(''); setPriceRange([0, 5000]) }}
            className="mt-4 text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
