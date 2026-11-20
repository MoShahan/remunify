import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '@/features/auth/auth-context'

const loginRequest = vi.hoisted(() => vi.fn())
const persistAuth = vi.hoisted(() => vi.fn())
const clearAuthStorage = vi.hoisted(() => vi.fn())
const getStoredToken = vi.hoisted(() => vi.fn(() => null))
const getStoredUser = vi.hoisted(() => vi.fn(() => null))
const setUnauthorizedHandler = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    loginRequest: (...args: unknown[]) => loginRequest(...args),
    persistAuth: (...args: unknown[]) => persistAuth(...args),
    clearAuthStorage: (...args: unknown[]) => clearAuthStorage(...args),
    getStoredToken: () => getStoredToken(),
    getStoredUser: () => getStoredUser(),
    setUnauthorizedHandler: (...args: unknown[]) =>
      setUnauthorizedHandler(...args),
  }
})

function Probe() {
  const { isAuthenticated, user, login, logout } = useAuth()
  return (
    <div>
      <p>{isAuthenticated ? `in:${user?.email}` : 'out'}</p>
      <button
        type="button"
        onClick={() => void login('hr@remunify.com', 'HR@123')}
      >
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getStoredToken.mockReturnValue(null)
    getStoredUser.mockReturnValue(null)
  })

  it('logs in, persists auth, and logs out', async () => {
    const user = userEvent.setup()
    loginRequest.mockResolvedValue({
      data: {
        token: 'tok',
        user: { id: '1', email: 'hr@remunify.com', role: 'HR' },
      },
    })

    render(
      <MemoryRouter>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('out')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('in:hr@remunify.com')).toBeInTheDocument()
    })
    expect(persistAuth).toHaveBeenCalledWith('tok', {
      id: '1',
      email: 'hr@remunify.com',
      role: 'HR',
    })

    await user.click(screen.getByRole('button', { name: 'Logout' }))
    expect(clearAuthStorage).toHaveBeenCalled()
    expect(screen.getByText('out')).toBeInTheDocument()
  })

  it('registers unauthorized handler that logs out and navigates', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<Probe />} />
            <Route path="/login" element={<p>Login route</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(setUnauthorizedHandler).toHaveBeenCalled()
    const handler = setUnauthorizedHandler.mock.calls[0][0] as () => void
    handler()

    expect(clearAuthStorage).toHaveBeenCalled()
    expect(await screen.findByText('Login route')).toBeInTheDocument()
  })

  it('throws when useAuth is outside provider', () => {
    expect(() => render(<Probe />)).toThrow(
      /useAuth must be used within AuthProvider/,
    )
  })
})
