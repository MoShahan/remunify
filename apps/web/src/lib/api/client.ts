import { getApiUrl } from '../env'
import {
  clearAuthStorage,
  getStoredToken,
  notifyUnauthorized,
} from './auth-storage'
import { parseApiError } from './errors'

export type ApiFetchOptions = RequestInit & {
  /** Skip Authorization header (e.g. login). */
  skipAuth?: boolean
  /** Skip 401 → logout redirect (e.g. login failures). */
  skipUnauthorizedRedirect?: boolean
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const {
    skipAuth = false,
    skipUnauthorizedRedirect = false,
    headers,
    ...init
  } = options

  const url = `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const nextHeaders = new Headers(headers)

  if (!nextHeaders.has('Accept')) {
    nextHeaders.set('Accept', 'application/json')
  }

  if (init.body && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const token = getStoredToken()
    if (token) {
      nextHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(url, { ...init, headers: nextHeaders })

  if (!response.ok) {
    const error = await parseApiError(response)
    if (error.status === 401 && !skipUnauthorizedRedirect) {
      clearAuthStorage()
      notifyUnauthorized()
    }
    throw error
  }

  return response
}

export async function apiJson<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await apiFetch(path, options)
  return (await response.json()) as T
}
