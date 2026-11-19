import { apiJson } from './client'
import type { LoginResponse } from './types'

export async function loginRequest(email: string, password: string) {
  return apiJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
    skipUnauthorizedRedirect: true,
  })
}
