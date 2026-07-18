import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Package, LogOut, Store } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Store size={28} />
          MiTienda
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
            Productos
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                <ShoppingCart size={22} />
              </Link>
              <Link to="/orders" className="text-gray-700 hover:text-blue-600">
                <Package size={22} />
              </Link>
              <div className="flex items-center gap-2">
                <User size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700">{user?.firstName}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
