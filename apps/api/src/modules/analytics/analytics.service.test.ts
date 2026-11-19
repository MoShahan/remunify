import { beforeEach, describe, expect, it, vi } from 'vitest'

const { transactionMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
}))

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    $transaction: transactionMock,
    $queryRaw: vi.fn(),
  },
}))

import { getAnalyticsSummary } from './analytics.service.js'

describe('analytics.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps SQL aggregates into a labeled multi-currency summary', async () => {
    transactionMock.mockResolvedValue([
      [{ total: 10n, active: 8n, inactive: 2n }],
      [
        {
          currency: 'INR',
          employee_count: 5n,
          total_amount: '1000.00',
          average_amount: '200.00',
          median_amount: '180.00',
        },
        {
          currency: 'USD',
          employee_count: 5n,
          total_amount: '500.00',
          average_amount: '100.00',
          median_amount: '90.00',
        },
      ],
      [
        {
          dimension: 'India',
          currency: 'INR',
          employee_count: 5n,
          total_amount: '1000.00',
        },
      ],
      [
        {
          dimension: 'Engineering',
          currency: 'USD',
          employee_count: 5n,
          total_amount: '500.00',
        },
      ],
      [
        {
          total_amount_usd: '615.00',
          employee_count: 10n,
          rates_as_of: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    ])

    const result = await getAnalyticsSummary()

    expect(result.headcount).toEqual({ total: 10, active: 8, inactive: 2 })
    expect(result.byCurrency).toHaveLength(2)
    expect(result.byCurrency[0]?.currency).toBe('INR')
    expect(result.companyWideUsd.label).toContain('demo FX')
    expect(result.companyWideUsd.ratesAsOf).toBe('2026-01-01')
    expect(result.byCountry[0]?.country).toBe('India')
    expect(result.byDepartment[0]?.department).toBe('Engineering')
  })
})
