import { describe, expect, it } from 'vitest'
import {
  currencyDisplayName,
  formatMoneyAmount,
  localeForCurrency,
} from './format-money'

describe('localeForCurrency', () => {
  it('uses en-IN for Indian-numbering currencies', () => {
    expect(localeForCurrency('INR')).toBe('en-IN')
    expect(localeForCurrency('PKR')).toBe('en-IN')
  })

  it('uses en-US for other currencies (including RUB)', () => {
    expect(localeForCurrency('USD')).toBe('en-US')
    expect(localeForCurrency('RUB')).toBe('en-US')
    expect(localeForCurrency(null)).toBe('en-US')
  })
})

describe('formatMoneyAmount', () => {
  it('formats INR with Indian grouping (lakh)', () => {
    expect(formatMoneyAmount('100000.00', 'INR')).toBe('1,00,000.00')
    expect(formatMoneyAmount('900000.00', 'INR')).toBe('9,00,000.00')
  })

  it('formats USD and RUB with western comma grouping (no spaces)', () => {
    expect(formatMoneyAmount('100000.00', 'USD')).toBe('100,000.00')
    expect(formatMoneyAmount('3125023.46', 'RUB')).toBe('3,125,023.46')
    expect(formatMoneyAmount('95000.50', 'USD')).toBe('95,000.50')
  })

  it('keeps two decimal places', () => {
    expect(formatMoneyAmount('1000', 'USD')).toBe('1,000.00')
  })
})

describe('currencyDisplayName', () => {
  it('returns the English currency name', () => {
    expect(currencyDisplayName('INR')).toBe('Indian Rupee')
    expect(currencyDisplayName('USD')).toBe('US Dollar')
    expect(currencyDisplayName('RUB')).toBe('Russian Ruble')
  })
})
