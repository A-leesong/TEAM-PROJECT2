import { create } from 'zustand'

interface AuthState {
  userId: string | null
  nickname: string | null
  tokenBalance: number
  accessToken: string | null
  isAuthenticated: boolean
  needsOnboarding: boolean
  setAuth: (userId: string, nickname: string, tokenBalance: number, accessToken: string) => void
  setNeedsOnboarding: (value: boolean) => void
  setTokenBalance: (balance: number) => void
  logout: () => void
}

const storedToken = localStorage.getItem('accessToken')
const storedUserId = localStorage.getItem('userId')
const storedNickname = localStorage.getItem('nickname')
const storedBalance = localStorage.getItem('tokenBalance')
const storedNeedsOnboarding = localStorage.getItem('needsOnboarding') === 'true'

export const useAuthStore = create<AuthState>((set) => ({
  userId: storedUserId,
  nickname: storedNickname,
  tokenBalance: storedBalance ? parseInt(storedBalance) : 0,
  accessToken: storedToken,
  isAuthenticated: !!storedToken,
  needsOnboarding: storedNeedsOnboarding,
  setAuth: (userId, nickname, tokenBalance, accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('userId', userId)
    localStorage.setItem('nickname', nickname)
    localStorage.setItem('tokenBalance', String(tokenBalance))
    set({ userId, nickname, tokenBalance, accessToken, isAuthenticated: true })
  },
  setNeedsOnboarding: (value) => {
    if (value) localStorage.setItem('needsOnboarding', 'true')
    else localStorage.removeItem('needsOnboarding')
    set({ needsOnboarding: value })
  },
  setTokenBalance: (balance) => {
    localStorage.setItem('tokenBalance', String(balance))
    set({ tokenBalance: balance })
  },
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('nickname')
    localStorage.removeItem('tokenBalance')
    localStorage.removeItem('needsOnboarding')
    set({ userId: null, nickname: null, tokenBalance: 0, accessToken: null, isAuthenticated: false, needsOnboarding: false })
  },
}))
