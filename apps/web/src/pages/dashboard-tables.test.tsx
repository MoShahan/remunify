import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from '@/pages/dashboard'

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

vi.mock('@/features/export/use-export', () => ({
  useExportActions: () => ({
    exporting: null,
    exportCsv: vi.fn(),
    exportXlsx: vi.fn(),
  }),
}))

describe('DashboardPage table links', () => {
  beforeEach(() => {
    getAnalyticsSummary.mockReset()
    getAnalyticsSummary.mockResolvedValue({
      data: {
        headcount: {
          total: 1,
          active: 1,
          inactive: 0,
          withSalary: 1,
          withoutSalary: 0,
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
      },
    })
  })

  it('links View full table to the matching tables view', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

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
})
