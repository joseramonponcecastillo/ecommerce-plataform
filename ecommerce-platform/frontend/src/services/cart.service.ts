import { api } from './api'

export const cartService = {
  async getCart() {
    const res = await api.get('/cart')
    return res.data
  },

  async addItem(productId: string, quantity: number) {
    const res = await api.post('/cart/items', { productId, quantity })
    return res.data
  },

  async updateItem(itemId: string, quantity: number) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity })
    return res.data
  },

  async removeItem(itemId: string) {
    const res = await api.delete(`/cart/items/${itemId}`)
    return res.data
  },
}
