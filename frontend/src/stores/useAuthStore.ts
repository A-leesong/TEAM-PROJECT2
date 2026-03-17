import { create } from 'zustand'

interface AuthState {
  userId: string | null
  nickname: string | null
  tokenBalance: number
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (userId: string, nickname: string, tokenBalance: number, token: string) => void
  setTokenBalance: (balance: number) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  nickname: null,
  tokenBalance: 0,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (userId, nickname, tokenBalance, token) => {
    localStorage.setItem('accessToken', token)
    set({ userId, nickname, tokenBalance, accessToken: token, isAuthenticated: true })
  },
  setTokenBalance: (balance) => set({ tokenBalance: balance }),
  logout: () => {
    localStorage.removeItem('accessToken')
    set({ userId: null, nickname: null, tokenBalance: 0, accessToken: null, isAuthenticated: false })
  },
}))
