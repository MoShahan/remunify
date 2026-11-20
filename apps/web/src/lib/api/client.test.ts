import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getApiUrl,
  getStoredToken,
  clearAuthStorage,
  notifyUnauthorized,
  parseApiError,
} = vi.hoisted(() => ({
  getApiUrl: vi.fn(() => 'http://api.test'),
  getStoredToken: vi.fn(() => 'tok'),
  clearAuthStorage: vi.fn(),
  notifyUnauthorized: vi.fn(),
  parseApiError: vi.fn(),
}))

vi.mock('../env', () => ({ getApiUrl }))
vi.mock('./auth-storage', () => ({
  getStoredToken,
  clearAuthStorage,
  notifyUnauthorized,
}))
vi.mock('./errors', async () => {
  const actual = await vi.importActual<typeof import('./errors')>('./errors')
  return {
    ...actual,
    parseApiError,
  }
})

import { ApiError } from './errors'
import { apiFetch, apiJson } from './client'

describe('apiFetch / apiJson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getApiUrl.mockReturnValue('http://api.test')
    getStoredToken.mockReturnValue('tok')
    parseApiError.mockResolvedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Unauthorized'),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('attaches Authorization and Accept headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/employees')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/employees',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer tok')
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('skips auth when skipAuth is set', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/auth/login', {
      skipAuth: true,
      method: 'POST',
      body: JSON.stringify({ email: 'a', password: 'b' }),
    })

    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBeNull()
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('clears auth and notifies on 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/api/employees')).rejects.toBeInstanceOf(ApiError)
    expect(clearAuthStorage).toHaveBeenCalled()
    expect(notifyUnauthorized).toHaveBeenCalled()
  })

  it('skips unauthorized redirect when requested', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiFetch('/api/auth/login', {
        skipAuth: true,
        skipUnauthorizedRedirect: true,
      }),
    ).rejects.toBeInstanceOf(ApiError)
    expect(clearAuthStorage).not.toHaveBeenCalled()
    expect(notifyUnauthorized).not.toHaveBeenCalled()
  })

  it('parses JSON via apiJson', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: '1' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      apiJson<{ data: { id: string } }>('api/employees/1'),
    ).resolves.toEqual({ data: { id: '1' } })
  })
})
