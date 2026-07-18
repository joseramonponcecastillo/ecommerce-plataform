import { api } from './api'

export interface CheckoutItem {
  productId: string
  quantity: number
}

export const orderService = {
  async getOrders() {
    const res = await api.get('/orders')
    return res.data
  },

  async getById(id: string) {
    const res = await api.get(`/orders/${id}`)
    return res.data
  },

  async checkout(items: CheckoutItem[]) {
    const res = await api.post('/orders/checkout', { items })
    return res.data
  },
}
