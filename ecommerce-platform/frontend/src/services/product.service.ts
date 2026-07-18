import { api } from './api'

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  page?: number
  limit?: number
}

export const productService = {
  async getAll(filters?: ProductFilters) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value))
      })
    }
    const res = await api.get(`/products?${params}`)
    return res.data
  },

  async getById(id: string) {
    const res = await api.get(`/products/${id}`)
    return res.data
  },

  async getCategories() {
    const res = await api.get('/products/categories')
    return res.data
  },
}
