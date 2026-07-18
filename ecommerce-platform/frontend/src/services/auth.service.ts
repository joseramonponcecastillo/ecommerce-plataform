import { api } from './api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData extends LoginData {
  firstName: string
  lastName: string
}

export const authService = {
  async login(data: LoginData) {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  async register(data: RegisterData) {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data
  },
}
