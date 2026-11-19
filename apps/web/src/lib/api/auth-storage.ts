import type { AuthUser } from './types'

const TOKEN_KEY = 'remunify_token'
const USER_KEY = 'remunify_user'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function persistAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

export function notifyUnauthorized() {
  onUnauthorized?.()
}
