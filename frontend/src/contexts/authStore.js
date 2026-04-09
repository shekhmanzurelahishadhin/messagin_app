import { create } from 'zustand'
import api from '../services/api'
import { disconnectEcho } from '../services/echo'

const storedUser  = localStorage.getItem('auth_user')
const storedToken = localStorage.getItem('auth_token')

const useAuthStore = create((set, get) => ({
  user:         storedUser  ? JSON.parse(storedUser) : null,
  token:        storedToken || null,
  isLoading:    false,
  error:        null,
  initialized:  false,

  // ------------------------------------------------------------------
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/login', { email, password })
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  register: async (name, email, password, passwordConfirmation) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, isLoading: false })
      return { success: true }
    } catch (err) {
      const errors  = err.response?.data?.errors
      const message = err.response?.data?.message || 'Registration failed.'
      set({ error: message, isLoading: false })
      return { success: false, message, errors }
    }
  },

  logout: async () => {
    try {
      await api.post('/logout')
    } catch (_) {
      // ignore
    } finally {
      disconnectEcho()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      set({ user: null, token: null })
    }
  },

  // Re-fetch current user to validate stored token
  initialize: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const { data } = await api.get('/user')
      localStorage.setItem('auth_user', JSON.stringify(data.data))
      set({ user: data.data, token, initialized: true })
    } catch (_) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      set({ user: null, token: null, initialized: true })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
