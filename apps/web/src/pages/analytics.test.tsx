import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'
import AnalyticsPage from '@/pages/analytics'

const getAnalyticsSummary = vi.fn()

vi.mock('@/lib/api/analytics', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/analytics')>(
    '@/lib/api/analytics',
  )
  return {
    ...actual,
    getAnalyticsSummary: (...args: unknown[]) => getAnalyticsSummary(...args),
  }
})

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: unknown }) => (
      <div data-testid="chart">{children as never}</div>
    ),
  }
})

const summary = {
  headcount: {
    total: 10,
    active: 8,
    inactive: 2,
    withSalary: 10,
    withoutSalary: 0,
  },
  byCurrency: [
    {
      currency: 'INR',
      employeeCount: 5,
      totalAmount: '1000.00',
      averageAmount: '200.00',
      medianAmount: '180.00',
    },
    {
      currency: 'USD',
      employeeCount: 5,
      totalAmount: '500.00',
      averageAmount: '100.00',
      medianAmount: '90.00',
    },
  ],
  byCountry: [
    {
      country: 'India',
      currency: 'INR',
      employeeCount: 5,
      totalAmount: '1000.00',
      averageAmount: '200.00',
    },
  ],
  byDepartment: [
    {
      department: 'Engineering',
      currency: 'INR',
      employeeCount: 3,
      totalAmount: '600.00',
      averageAmount: '200.00',
    },
    {
      department: 'HR',
      currency: 'USD',
      employeeCount: 2,
      totalAmount: '200.00',
      averageAmount: '100.00',
    },
  ],
  averageByCountryUsd: [
    {
      country: 'India',
      averageAmountUsd: '12.00',
      employeeCount: 5,
    },
  ],
  companyWideUsd: {
    totalAmountUsd: '615.00',
    employeeCount: 10,
    ratesAsOf: '2026-01-01',
    label: 'demo FX',
  },
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    getAnalyticsSummary.mockReset()
  })

  it('shows chart sections and tables jump links after load', async () => {
    getAnalyticsSummary.mockResolvedValue({ data: summary })
    renderPage()

    expect(await screen.findByText('Employees by currency')).toBeInTheDocument()
    expect(
      screen.getByText('Median vs average by currency'),
    ).toBeInTheDocument()
    expect(screen.getByText('Average salary by country')).toBeInTheDocument()
    expect(screen.getByText(/Rates as of 2026-01-01/)).toBeInTheDocument()
    expect(screen.getByText('Top cohorts')).toBeInTheDocument()
    expect(screen.getByText('Full tables')).toBeInTheDocument()

    expect(screen.queryByText('Active vs inactive')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'View full table' }),
    ).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'By currency' })).toHaveAttribute(
      'href',
      '/tables?view=currency',
    )
    expect(screen.getByRole('link', { name: 'By country' })).toHaveAttribute(
      'href',
      '/tables?view=country',
    )
    expect(screen.getByRole('link', { name: 'By department' })).toHaveAttribute(
      'href',
      '/tables?view=department',
    )
  })

  it('shows empty country averages copy when none exist', async () => {
    getAnalyticsSummary.mockResolvedValue({
      data: {
        ...summary,
        averageByCountryUsd: [],
      },
    })
    renderPage()

    expect(
      await screen.findByText('No country averages available.'),
    ).toBeInTheDocument()
  })

  it('switches chart currency from the select', async () => {
    const user = userEvent.setup()
    getAnalyticsSummary.mockResolvedValue({ data: summary })
    renderPage()

    expect(await screen.findByLabelText('Chart currency')).toHaveTextContent(
      'INR',
    )
    await user.click(screen.getByLabelText('Chart currency'))
    await user.click(await screen.findByRole('option', { name: 'USD' }))

    expect(screen.getByLabelText('Chart currency')).toHaveTextContent('USD')
    expect(await screen.findByText('HR')).toBeInTheDocument()
  })

  it('shows error state when the summary fails', async () => {
    getAnalyticsSummary.mockRejectedValue(
      new ApiError(500, 'INTERNAL', 'Analytics failed'),
    )
    renderPage()

    expect(await screen.findByText('Analytics failed')).toBeInTheDocument()
  })

  it('shows a stale banner when refresh fails after data loaded', async () => {
    getAnalyticsSummary
      .mockResolvedValueOnce({ data: summary })
      .mockRejectedValueOnce(new ApiError(503, 'UNAVAILABLE', 'Refresh failed'))

    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
      },
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('Employees by currency')).toBeInTheDocument()

    await client.refetchQueries({ queryKey: ['analytics', 'summary'] })

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Refresh failed')
    })
  })
})
