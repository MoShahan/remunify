import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import EmployeesPage from '@/pages/employees-page'

const listEmployees = vi.fn()

vi.mock('@/lib/api/employees', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/employees')>(
    '@/lib/api/employees',
  )
  return {
    ...actual,
    listEmployees: (...args: unknown[]) => listEmployees(...args),
    getEmployee: vi.fn(),
  }
})

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/employees']}>
        <EmployeesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    listEmployees.mockReset()
  })

  it('renders employee rows from the API', async () => {
    listEmployees.mockResolvedValue({
      data: [
        {
          id: 'emp_1',
          employeeNumber: 'E00001',
          fullName: 'Aisha Shah',
          email: 'aisha@example.com',
          joinedAt: '2022-01-01',
          country: 'India',
          department: 'Engineering',
          designation: 'Manager',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          salary: {
            id: 'sal_1',
            amount: '100000.00',
            currency: 'INR',
            period: 'ANNUAL',
            effectiveFrom: '2024-01-01',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    renderPage()

    expect(await screen.findByText('Aisha Shah')).toBeInTheDocument()
    expect(screen.getByText('E00001')).toBeInTheDocument()
    expect(screen.getByText('100000.00')).toBeInTheDocument()
  })

  it('shows ErrorState when the list request fails', async () => {
    listEmployees.mockRejectedValue(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error'),
    )

    renderPage()

    expect(await screen.findByText('Unable to load')).toBeInTheDocument()
    expect(screen.getByText('Unexpected server error')).toBeInTheDocument()
  })
})
