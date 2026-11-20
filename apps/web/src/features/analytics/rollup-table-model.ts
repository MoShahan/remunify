import type { AnalyticsSummary, CurrencyAgg } from '@/lib/api'

export const PREVIEW_ROW_LIMIT = 8
export const DEFAULT_TABLES_PAGE_SIZE = 25
export const DEFAULT_EMPLOYEES_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100] as const
export const MAX_PAGE_SIZE = 100

/** e.g. "Showing 1–8 of 42" for preview cards. */
export function previewRangeLabel(
  total: number,
  limit: number = PREVIEW_ROW_LIMIT,
): string {
  if (total <= 0) return 'Showing 0 of 0'
  const end = Math.min(limit, total)
  return `Showing 1-${end.toLocaleString()} of ${total.toLocaleString()}`
}

export function parsePageSize(
  value: string | null | undefined,
  fallback: number = DEFAULT_TABLES_PAGE_SIZE,
): number {
  if (value == null || value.trim() === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(MAX_PAGE_SIZE, Math.trunc(n))
}

export type TableViewId = 'currency' | 'country' | 'department'

export type CountryRollupRow = AnalyticsSummary['byCountry'][number]
export type DepartmentRollupRow = AnalyticsSummary['byDepartment'][number]

export type RollupRow = CurrencyAgg | CountryRollupRow | DepartmentRollupRow

export type TableViewMeta = {
  id: TableViewId
  title: string
  description: string
}

export const TABLE_VIEWS: TableViewMeta[] = [
  {
    id: 'currency',
    title: 'By currency',
    description:
      'Current salary headcount, total, average, and median - one row per pay currency (never mixed FX).',
  },
  {
    id: 'country',
    title: 'By country',
    description:
      'Current salaries grouped by country and currency - totals and averages stay in that currency.',
  },
  {
    id: 'department',
    title: 'By department',
    description:
      'Current salaries grouped by department and currency - same per-currency rule as country.',
  },
]

export function parseTableView(value: string | null | undefined): TableViewId {
  if (value === 'country' || value === 'department' || value === 'currency') {
    return value
  }
  return 'currency'
}

export function getTableViewMeta(id: TableViewId): TableViewMeta {
  return TABLE_VIEWS.find((view) => view.id === id) ?? TABLE_VIEWS[0]!
}

export function rowsForView(
  summary: AnalyticsSummary,
  view: TableViewId,
): RollupRow[] {
  if (view === 'currency') return summary.byCurrency
  if (view === 'country') return summary.byCountry
  return summary.byDepartment
}

export type RollupSortKey =
  | 'label'
  | 'currency'
  | 'employeeCount'
  | 'totalAmount'
  | 'averageAmount'
  | 'medianAmount'

const DEFAULT_SORT: Record<TableViewId, RollupSortKey> = {
  currency: 'currency',
  country: 'label',
  department: 'label',
}

export function defaultSortKey(view: TableViewId): RollupSortKey {
  return DEFAULT_SORT[view]
}

export function sortableKeysForView(view: TableViewId): RollupSortKey[] {
  if (view === 'currency') {
    return [
      'currency',
      'employeeCount',
      'totalAmount',
      'averageAmount',
      'medianAmount',
    ]
  }
  return ['label', 'currency', 'employeeCount', 'totalAmount', 'averageAmount']
}

export function parseSortKey(
  view: TableViewId,
  value: string | null,
): RollupSortKey {
  const allowed = sortableKeysForView(view)
  if (value && (allowed as string[]).includes(value)) {
    return value as RollupSortKey
  }
  return defaultSortKey(view)
}

function rowLabel(view: TableViewId, row: RollupRow): string {
  if (view === 'currency') return (row as CurrencyAgg).currency
  if (view === 'country') return (row as CountryRollupRow).country
  return (row as DepartmentRollupRow).department
}

function amountNumber(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function sortRollupRows(
  view: TableViewId,
  rows: RollupRow[],
  sortBy: RollupSortKey,
  sortOrder: 'asc' | 'desc',
): RollupRow[] {
  const dir = sortOrder === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'label') {
      cmp = rowLabel(view, a).localeCompare(rowLabel(view, b))
    } else if (sortBy === 'currency') {
      cmp = a.currency.localeCompare(b.currency)
    } else if (sortBy === 'employeeCount') {
      cmp = a.employeeCount - b.employeeCount
    } else if (sortBy === 'totalAmount') {
      cmp = amountNumber(a.totalAmount) - amountNumber(b.totalAmount)
    } else if (sortBy === 'averageAmount') {
      cmp = amountNumber(a.averageAmount) - amountNumber(b.averageAmount)
    } else if (sortBy === 'medianAmount') {
      const am = 'medianAmount' in a ? a.medianAmount : '0'
      const bm = 'medianAmount' in b ? b.medianAmount : '0'
      cmp = amountNumber(am) - amountNumber(bm)
    }
    return cmp * dir
  })
}
