import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import EmployeeDetailPage from '@/pages/employee-detail'

const getEmployee = vi.fn()
const updateEmployeeStatus = vi.fn()

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/api/employees', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/employees')>(
    '@/lib/api/employees',
  )
  return {
    ...actual,
    getEmployee: (...args: unknown[]) => getEmployee(...args),
    updateEmployeeStatus: (...args: unknown[]) => updateEmployeeStatus(...args),
  }
})

const employee = {
  id: 'emp_1',
  employeeNumber: 'E00001',
  fullName: 'Aisha Shah',
  email: 'aisha@example.com',
  joinedAt: '2022-01-01',
  country: 'India',
  department: 'Engineering',
  designation: 'Manager',
  status: 'ACTIVE' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  salary: null,
  salaryHistory: [],
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/employees/emp_1']}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function chooseInactive() {
  const user = userEvent.setup()
  renderPage()
  expect(await screen.findByText('Aisha Shah')).toBeInTheDocument()
  await user.click(screen.getByLabelText('Employment status'))
  await user.click(await screen.findByRole('option', { name: 'Inactive' }))
  return user
}

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    getEmployee.mockReset()
    updateEmployeeStatus.mockReset()
    getEmployee.mockResolvedValue({ data: employee })
  })

  it('asks for confirmation before patching status', async () => {
    updateEmployeeStatus.mockResolvedValue({
      data: { ...employee, status: 'INACTIVE' },
    })

    const user = await chooseInactive()

    expect(
      await screen.findByRole('heading', {
        name: 'Change employment status?',
      }),
    ).toBeInTheDocument()
    expect(updateEmployeeStatus).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(updateEmployeeStatus).toHaveBeenCalledWith('emp_1', 'INACTIVE')
  })

  it('does not patch status when confirmation is cancelled', async () => {
    const user = await chooseInactive()

    expect(
      await screen.findByRole('heading', {
        name: 'Change employment status?',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(updateEmployeeStatus).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('heading', { name: 'Change employment status?' }),
    ).not.toBeInTheDocument()
  })

  it('shows error state when employee load fails', async () => {
    getEmployee.mockRejectedValue(
      new ApiError(404, 'NOT_FOUND', 'Employee not found'),
    )
    renderPage()
    expect(await screen.findByText('Employee not found')).toBeInTheDocument()
  })

  it('renders salary history rows when present', async () => {
    getEmployee.mockResolvedValue({
      data: {
        ...employee,
        salary: {
          id: 'sal_2',
          amount: '120000.00',
          currency: 'INR',
          period: 'ANNUAL',
          effectiveFrom: '2025-01-01',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        salaryHistory: [
          {
            id: 'sal_1',
            amount: '100000.00',
            currency: 'INR',
            period: 'ANNUAL',
            effectiveFrom: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'sal_2',
            amount: '120000.00',
            currency: 'INR',
            period: 'ANNUAL',
            effectiveFrom: '2025-01-01',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      },
    })
    renderPage()
    expect(await screen.findByText('Aisha Shah')).toBeInTheDocument()
    expect(screen.getByText('Salary history')).toBeInTheDocument()
    expect(screen.getAllByText(/1,00,000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/1,20,000/).length).toBeGreaterThan(0)
  })
})
