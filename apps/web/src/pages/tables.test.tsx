import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TablesPage from '@/pages/tables'

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

const summary = {
  headcount: {
    total: 10,
    active: 8,
    inactive: 2,
    withSalary: 10,
    withoutSalary: 0,
  },
  byCurrency: Array.from({ length: 30 }, (_, i) => ({
    currency: `C${String(i).padStart(2, '0')}`,
    employeeCount: i + 1,
    totalAmount: `${(i + 1) * 1000}.00`,
    averageAmount: '100.00',
    medianAmount: '90.00',
  })),
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
      currency: 'USD',
      employeeCount: 5,
      totalAmount: '500.00',
      averageAmount: '100.00',
    },
  ],
  averageByCountryUsd: [],
  companyWideUsd: {
    totalAmountUsd: '615.00',
    employeeCount: 10,
    ratesAsOf: '2026-01-01',
    label: 'demo FX',
  },
}

function renderPage(initial = '/tables') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initial]}>
        <TablesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function findRangeLabel(pattern: RegExp) {
  return screen.findByText((_, element) => {
    if (element?.tagName !== 'P') return false
    return pattern.test(element.textContent ?? '')
  })
}

describe('TablesPage', () => {
  beforeEach(() => {
    getAnalyticsSummary.mockReset()
    getAnalyticsSummary.mockResolvedValue({ data: summary })
  })

  it('falls back to currency when view is invalid', async () => {
    renderPage('/tables?view=nope')

    expect(await findRangeLabel(/Showing 1-25 of 30/)).toBeInTheDocument()
    expect(screen.getByLabelText('Select analytics table')).toHaveTextContent(
      'By currency',
    )
  })

  it('switches view from the descriptive select', async () => {
    const user = userEvent.setup()
    renderPage('/tables?view=currency')

    expect(await findRangeLabel(/Showing 1-25 of 30/)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Select analytics table'))
    await user.click(await screen.findByRole('option', { name: /By country/i }))

    expect(await screen.findByText('India')).toBeInTheDocument()
    expect(screen.getByLabelText('Select analytics table')).toHaveTextContent(
      'By country',
    )
  })

  it('clamps go-to-page to total pages', async () => {
    const user = userEvent.setup()
    renderPage('/tables?view=currency&page=1')

    expect(await findRangeLabel(/Showing 1-25 of 30/)).toBeInTheDocument()
    const pageInput = screen.getByLabelText('Go to page')
    await user.clear(pageInput)
    await user.type(pageInput, '99')
    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(await findRangeLabel(/Showing 26-30 of 30/)).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /C25:/i }).length,
    ).toBeGreaterThan(0)
  })

  it('changes rows per page from the select', async () => {
    const user = userEvent.setup()
    renderPage('/tables?view=currency&pageSize=25')

    expect(await findRangeLabel(/Showing 1-25 of 30/)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Rows per page'))
    await user.click(await screen.findByRole('option', { name: '10' }))

    expect(await findRangeLabel(/Showing 1-10 of 30/)).toBeInTheDocument()
    expect(screen.getByLabelText('Rows per page')).toHaveTextContent('10')
  })
})
