import client from './client'
import type { AuthResponse } from '../types'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await client.post('/auth/login', { email, password })
  return res.data
}

export async function signup(data: {
  name: string; nickname: string; email: string; phone: string; password: string
}): Promise<AuthResponse> {
  const res = await client.post('/auth/register', data)
  return res.data
}

export async function requestPasswordReset(data: {
  name: string; nickname: string; email: string
}): Promise<void> {
  await client.post('/auth/password-reset', data)
}

export async function confirmPasswordReset(data: {
  token: string; newPassword: string
}): Promise<void> {
  await client.post('/auth/password-reset/confirm', data)
}
