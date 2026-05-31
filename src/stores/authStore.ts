import { create } from 'zustand'
import type { User } from '../types'
import { api } from '../services/api'

export interface LoginResponse {
  token: string
  user: Pick<User, 'id' | 'nome' | 'email' | 'role'>
  empresa: { id: number; razaoSocial: string; nomeFantasia: string }
}

interface AuthState {
  user: Pick<User, 'id' | 'nome' | 'email' | 'role'> | null
  empresa: { id: number; razaoSocial: string; nomeFantasia: string } | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  empresa: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  init: () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        set({
          token,
          user: { id: payload.userId, nome: payload.nome || '', email: payload.email || '', role: payload.role },
          empresa: { id: payload.empresaId, razaoSocial: '', nomeFantasia: '' },
          isAuthenticated: true,
        })
      } catch {
        localStorage.removeItem('token')
      }
    }
  },

  login: async (email: string, senha: string) => {
    set({ loading: true })
    try {
      const data = await api.post<LoginResponse>('/auth/login', { email, senha })
      localStorage.setItem('token', data.token)
      set({ user: data.user, empresa: data.empresa, token: data.token, isAuthenticated: true, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, empresa: null, token: null, isAuthenticated: false })
  },
}))
