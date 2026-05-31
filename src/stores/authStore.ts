import { create } from 'zustand'
import type { User } from '../types'
import { mockUsers } from '../mock/users'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, password: string) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.senha === password && u.ativo
    )
    if (found) {
      set({ user: found, isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))
