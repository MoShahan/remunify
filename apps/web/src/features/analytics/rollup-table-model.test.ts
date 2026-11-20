import { describe, expect, it } from 'vitest'
import type { AnalyticsSummary } from '@/lib/api'
import {
  defaultSortKey,
  getTableViewMeta,
  parsePageSize,
  parseSortKey,
  parseTableView,
  previewRangeLabel,
  rowsForView,
  sortableKeysForView,
  sortRollupRows,
} from './rollup-table-model'

const summary = {
  headcount: {
    total: 3,
    active: 3,
    inactive: 0,
    withSalary: 3,
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
    {
      currency: 'INR',
      employeeCount: 2,
      totalAmount: '200.00',
      averageAmount: '100.00',
      medianAmount: 'bad',
    },
  ],
  byCountry: [
    {
      country: 'India',
      currency: 'INR',
      employeeCount: 2,
      totalAmount: '200.00',
      averageAmount: '100.00',
    },
    {
      country: 'USA',
      currency: 'USD',
      employeeCount: 1,
      totalAmount: '100.00',
      averageAmount: '100.00',
    },
  ],
  byDepartment: [
    {
      department: 'HR',
      currency: 'USD',
      employeeCount: 1,
      totalAmount: '50.00',
      averageAmount: '50.00',
    },
    {
      department: 'Engineering',
      currency: 'INR',
      employeeCount: 2,
      totalAmount: '200.00',
      averageAmount: '100.00',
    },
  ],
  averageByCountryUsd: [],
  companyWideUsd: {
    totalAmountUsd: '0',
    employeeCount: 0,
    ratesAsOf: null,
    label: 'demo',
  },
} satisfies AnalyticsSummary

describe('rollup-table-model', () => {
  it('formats preview ranges and page sizes', () => {
    expect(previewRangeLabel(0)).toBe('Showing 0 of 0')
    expect(previewRangeLabel(42, 8)).toBe('Showing 1-8 of 42')
    expect(parsePageSize(null)).toBe(25)
    expect(parsePageSize('')).toBe(25)
    expect(parsePageSize('nope')).toBe(25)
    expect(parsePageSize('200')).toBe(100)
    expect(parsePageSize('10')).toBe(10)
  })

  it('parses views and sort keys', () => {
    expect(parseTableView('country')).toBe('country')
    expect(parseTableView('nope')).toBe('currency')
    expect(getTableViewMeta('department').id).toBe('department')
    expect(defaultSortKey('currency')).toBe('currency')
    expect(sortableKeysForView('country')).toContain('label')
    expect(parseSortKey('currency', 'medianAmount')).toBe('medianAmount')
    expect(parseSortKey('currency', 'nope')).toBe('currency')
  })

  it('selects rows for each view', () => {
    expect(rowsForView(summary, 'currency')).toHaveLength(2)
    expect(rowsForView(summary, 'country')[0]).toMatchObject({
      country: 'India',
    })
    expect(rowsForView(summary, 'department')[0]).toMatchObject({
      department: 'HR',
    })
  })

  it('sorts by label, currency, counts, and amounts', () => {
    const countries = sortRollupRows(
      'country',
      summary.byCountry,
      'label',
      'asc',
    )
    expect(countries[0]).toMatchObject({ country: 'India' })

    const currenciesDesc = sortRollupRows(
      'currency',
      summary.byCurrency,
      'employeeCount',
      'desc',
    )
    expect(currenciesDesc[0]?.currency).toBe('INR')

    const byTotal = sortRollupRows(
      'department',
      summary.byDepartment,
      'totalAmount',
      'asc',
    )
    expect(byTotal[0]).toMatchObject({ department: 'HR' })

    const byAvg = sortRollupRows(
      'department',
      summary.byDepartment,
      'averageAmount',
      'desc',
    )
    expect(byAvg[0]).toMatchObject({ department: 'Engineering' })

    const byMedian = sortRollupRows(
      'currency',
      summary.byCurrency,
      'medianAmount',
      'asc',
    )
    expect(byMedian[0]?.currency).toBe('INR')

    const byCurrency = sortRollupRows(
      'currency',
      summary.byCurrency,
      'currency',
      'asc',
    )
    expect(byCurrency[0]?.currency).toBe('INR')
  })
})
