import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from '@/components/app-shell'

const logout = vi.fn()
const exportCsv = vi.fn()
const exportXlsx = vi.fn()

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'hr@remunify.com', role: 'HR' },
    logout,
    token: 'tok',
    isAuthenticated: true,
    isBootstrapping: false,
    login: vi.fn(),
  }),
}))

vi.mock('@/features/export/use-export', () => ({
  useExportActions: () => ({
    exporting: null,
    exportCsv,
    exportXlsx,
  }),
}))

function renderShell(initial = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Dash body</div>} />
          <Route path="/login" element={<div>Login page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders nav links and outlet content', () => {
    renderShell()
    expect(screen.getByText('Dash body')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Employees' })).toHaveAttribute(
      'href',
      '/employees',
    )
    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/analytics',
    )
    expect(screen.getByText('hr@remunify.com')).toBeInTheDocument()
  })

  it('exports from the export menu', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: /Export/i }))
    await user.click(await screen.findByText('Download CSV'))
    expect(exportCsv).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Export/i }))
    await user.click(await screen.findByText('Download Excel'))
    expect(exportXlsx).toHaveBeenCalled()
  })

  it('signs out and navigates to login', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: /hr@remunify.com/i }))
    await user.click(await screen.findByText('Sign out'))

    expect(logout).toHaveBeenCalled()
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
