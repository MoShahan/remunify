import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '@/app/providers'
import { AuthProvider } from '@/features/auth/auth-context'
import { GuestOnly } from '@/features/auth/require-auth'
import LoginPage from '@/pages/login'
import { ApiError } from '@/lib/api/errors'

const loginRequest = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    loginRequest: (...args: unknown[]) => loginRequest(...args),
  }
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AppProviders>
        <AuthProvider>
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route path="/dashboard" element={<div>Dashboard ready</div>} />
          </Routes>
        </AuthProvider>
      </AppProviders>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginRequest.mockReset()
    localStorage.clear()
  })

  it('shows API message on failed login', async () => {
    const user = userEvent.setup()
    loginRequest.mockRejectedValue(
      new ApiError(
        401,
        'UNAUTHORIZED',
        'Invalid email or password. Check your credentials and try again.',
      ),
    )

    renderLogin()

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'hr@remunify.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText(
        'Invalid email or password. Check your credentials and try again.',
      ),
    ).toBeInTheDocument()
  })

  it('navigates to dashboard on success', async () => {
    const user = userEvent.setup()
    loginRequest.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: 'u1', email: 'hr@remunify.com', role: 'HR' },
      },
    })

    renderLogin()

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'hr@remunify.com')
    await user.type(screen.getByLabelText('Password'), 'HR@123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard ready')).toBeInTheDocument()
    })
  })
})
