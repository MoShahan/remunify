import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import EmployeesPage from '@/pages/employees'

const listEmployees = vi.fn()
const getEmployeeFacets = vi.fn()

vi.mock('@/lib/api/employees', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/employees')>(
    '@/lib/api/employees',
  )
  return {
    ...actual,
    listEmployees: (...args: unknown[]) => listEmployees(...args),
    getEmployeeFacets: (...args: unknown[]) => getEmployeeFacets(...args),
    getEmployee: vi.fn(),
  }
})

const employeeRow = {
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
}

function renderPage(initial = '/employees') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initial]}>
        <EmployeesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    listEmployees.mockReset()
    getEmployeeFacets.mockReset()
    getEmployeeFacets.mockResolvedValue({
      data: {
        countries: ['India', 'United States'],
        departments: ['Engineering', 'Finance'],
      },
    })
  })

  it('renders employee rows from the API', async () => {
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    renderPage()

    expect(await screen.findByText('Aisha Shah')).toBeInTheDocument()
    expect(screen.getByText('E00001')).toBeInTheDocument()
    expect(screen.getByText('1,00,000.00')).toBeInTheDocument()
  })

  it('applies country filter from the select', async () => {
    const user = userEvent.setup()
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    renderPage()
    await screen.findByText('Aisha Shah')

    const trigger = screen.getByLabelText('Filter by country')
    await user.click(trigger)
    const option = await screen.findByRole('option', { name: /India/i })
    await user.click(option)

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'India', page: 1 }),
    )
  })

  it('reads country filter from the URL', async () => {
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    renderPage('/employees?country=India')
    await screen.findByText('Aisha Shah')

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'India' }),
    )
  })

  it('toggles sort order when clicking an active header', async () => {
    const user = userEvent.setup()
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })

    renderPage('/employees?sortBy=fullName&sortOrder=asc')
    await screen.findByText('Aisha Shah')

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }))

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'fullName', sortOrder: 'desc' }),
    )
  })

  it('clamps go-to-page input to totalPages', async () => {
    const user = userEvent.setup()
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 40, totalPages: 2 },
    })

    renderPage()
    await screen.findByText('Aisha Shah')

    const pageInput = screen.getByLabelText('Go to page')
    await user.clear(pageInput)
    await user.type(pageInput, '99')
    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    )
  })

  it('changes rows per page from the select', async () => {
    const user = userEvent.setup()
    listEmployees.mockResolvedValue({
      data: [employeeRow],
      pagination: { page: 1, pageSize: 20, total: 40, totalPages: 2 },
    })

    renderPage()
    await screen.findByText('Aisha Shah')

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 20 }),
    )

    await user.click(screen.getByLabelText('Rows per page'))
    await user.click(await screen.findByRole('option', { name: '50' }))

    expect(listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 50, page: 1 }),
    )
  })

  it('shows ErrorState when the list request fails', async () => {
    listEmployees.mockRejectedValue(
      new ApiError(500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error'),
    )

    renderPage()

    expect(await screen.findByText('Unable to load')).toBeInTheDocument()
    expect(screen.getByText('Unexpected server error')).toBeInTheDocument()
    expect(
      within(document.body).queryByText('Aisha Shah'),
    ).not.toBeInTheDocument()
  })
})
