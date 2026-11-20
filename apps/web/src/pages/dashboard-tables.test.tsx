import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import DashboardPage from '@/pages/dashboard'

const getAnalyticsSummary = vi.fn()
const exportCsv = vi.fn()
const exportXlsx = vi.fn()

vi.mock('@/lib/api/analytics', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/analytics')>(
    '@/lib/api/analytics',
  )
  return {
    ...actual,
    getAnalyticsSummary: (...args: unknown[]) => getAnalyticsSummary(...args),
  }
})

vi.mock('@/features/export/use-export', () => ({
  useExportActions: () => ({
    exporting: null,
    exportCsv,
    exportXlsx,
  }),
}))

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: unknown }) => (
      <div data-testid="chart">{children as never}</div>
    ),
  }
})

const summaryData = {
  headcount: {
    total: 10,
    active: 8,
    inactive: 2,
    withSalary: 9,
    withoutSalary: 1,
  },
  byCurrency: [
    {
      currency: 'USD',
      employeeCount: 1,
      totalAmount: '100.00',
      averageAmount: '100.00',
      medianAmount: '100.00',
    },
  ],
  byCountry: [
    {
      country: 'United States',
      currency: 'USD',
      employeeCount: 1,
      totalAmount: '100.00',
      averageAmount: '100.00',
    },
  ],
  byDepartment: [
    {
      department: 'Engineering',
      currency: 'USD',
      employeeCount: 1,
      totalAmount: '100.00',
      averageAmount: '100.00',
    },
  ],
  averageByCountryUsd: [],
  companyWideUsd: {
    totalAmountUsd: '100.00',
    employeeCount: 1,
    ratesAsOf: null,
    label: 'demo FX',
  },
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    getAnalyticsSummary.mockReset()
    exportCsv.mockReset()
    exportXlsx.mockReset()
    getAnalyticsSummary.mockResolvedValue({ data: summaryData })
  })

  it('links View full table to the matching tables view', async () => {
    renderDashboard()

    const links = await screen.findAllByRole('link', {
      name: 'View full table',
    })
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      expect.arrayContaining([
        '/tables?view=currency',
        '/tables?view=country',
        '/tables?view=department',
      ]),
    )
  })

  it('renders KPI labels, coverage, status pie, and export actions', async () => {
    const user = userEvent.setup()
    renderDashboard()

    expect(await screen.findByText('Total headcount')).toBeInTheDocument()
    expect(screen.getAllByText('With salary').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Active vs inactive')).toBeInTheDocument()
    expect(screen.getByText('Salary coverage')).toBeInTheDocument()
    expect(screen.queryByText('Top currencies')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /CSV/i }))
    await user.click(screen.getByRole('button', { name: /Excel/i }))
    expect(exportCsv).toHaveBeenCalled()
    expect(exportXlsx).toHaveBeenCalled()
  })

  it('shows ErrorState when summary fails', async () => {
    getAnalyticsSummary.mockRejectedValue(
      new ApiError(500, 'INTERNAL', 'Dashboard failed'),
    )
    renderDashboard()

    expect(await screen.findByText('Dashboard failed')).toBeInTheDocument()
  })
})
