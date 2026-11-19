import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers'
import { AuthProvider } from '@/features/auth/auth-context'
import { RequireAuth } from '@/features/auth/require-auth'
import LoginPage from '@/pages/login-page'

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects unauthenticated users to login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppProviders>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<div>Secret</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </AppProviders>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })
})
