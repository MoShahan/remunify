import { describe, expect, it } from 'vitest'
import { salaryBodySchema } from './salaries.schemas.js'

describe('salaryBodySchema', () => {
  it('normalizes currency and amount', () => {
    const parsed = salaryBodySchema.parse({
      amount: 125000.5,
      currency: 'usd',
      effectiveFrom: '2024-01-01',
    })

    expect(parsed.amount).toBe('125000.5')
    expect(parsed.currency).toBe('USD')
    expect(parsed.period).toBe('ANNUAL')
    expect(parsed.effectiveFrom.toISOString()).toBe('2024-01-01T00:00:00.000Z')
  })

  it('rejects non-positive amounts', () => {
    const result = salaryBodySchema.safeParse({
      amount: '0',
      currency: 'INR',
      effectiveFrom: '2024-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid currency codes', () => {
    const result = salaryBodySchema.safeParse({
      amount: '100',
      currency: 'US',
      effectiveFrom: '2024-01-01',
    })
    expect(result.success).toBe(false)
  })
})
