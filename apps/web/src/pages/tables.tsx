import { useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { PageHeader } from '@/components/page-header'
import { CardSkeleton } from '@/components/skeletons'
import { StaleDataBanner } from '@/components/stale-data-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TABLE_VIEWS,
  TABLES_PAGE_SIZE,
  defaultSortKey,
  getTableViewMeta,
  parseSortKey,
  parseTableView,
  rowsForView,
  sortRollupRows,
  type RollupSortKey,
  type TableViewId,
} from '@/features/analytics/rollup-table-model'
import { AnalyticsRollupTable } from '@/features/analytics/rollup-tables'
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'

function readSortOrder(value: string | null): 'asc' | 'desc' {
  return value === 'desc' ? 'desc' : 'asc'
}

export default function TablesPage() {
  const query = useAnalyticsSummary()
  const [searchParams, setSearchParams] = useSearchParams()

  const view = parseTableView(searchParams.get('view'))
  const viewMeta = getTableViewMeta(view)
  const sortBy = parseSortKey(view, searchParams.get('sortBy'))
  const sortOrder = readSortOrder(searchParams.get('sortOrder'))
  const pageRaw = Number(searchParams.get('page') ?? '1')
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.trunc(pageRaw) : 1

  const [pageInput, setPageInput] = useState(String(page))
  const [prevPage, setPrevPage] = useState(page)
  if (page !== prevPage) {
    setPrevPage(page)
    setPageInput(String(page))
  }

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const setView = (nextView: TableViewId) => {
    updateParams({
      view: nextView,
      page: '1',
      sortBy: defaultSortKey(nextView),
      sortOrder: 'asc',
    })
  }

  const handleSort = (column: RollupSortKey) => {
    if (sortBy === column) {
      updateParams({
        sortBy: column,
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
        page: '1',
      })
      return
    }
    updateParams({ sortBy: column, sortOrder: 'asc', page: '1' })
  }

  const allRows = query.data ? rowsForView(query.data, view) : []
  const sorted = sortRollupRows(view, allRows, sortBy, sortOrder)
  const totalPages = Math.max(1, Math.ceil(sorted.length / TABLES_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rangeStart =
    sorted.length === 0 ? 0 : (safePage - 1) * TABLES_PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * TABLES_PAGE_SIZE, sorted.length)
  const pageRows = sorted.slice(
    (safePage - 1) * TABLES_PAGE_SIZE,
    safePage * TABLES_PAGE_SIZE,
  )

  const goToPage = () => {
    const raw = Number(pageInput)
    if (!Number.isFinite(raw) || pageInput.trim() === '') return
    const clamped = Math.min(Math.max(Math.trunc(raw), 1), totalPages)
    setPageInput(String(clamped))
    updateParams({ page: String(clamped) })
  }

  const onPageKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      goToPage()
    }
  }

  return (
    <div>
      <PageHeader
        title="Tables"
        description="Full compensation rollups from current salaries. Pick a table, sort columns, and page through every row."
      />

      <div className="mb-5 max-w-2xl">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Table
        </label>
        <Select
          value={view}
          onValueChange={(value) => setView(parseTableView(value))}
        >
          <SelectTrigger
            className="h-auto min-h-10 w-full py-2 text-left"
            aria-label="Select analytics table"
          >
            <SelectValue>{viewMeta.title}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[min(24rem,70vh)] w-[var(--radix-select-trigger-width)] max-w-[min(100vw-2rem,36rem)]">
            {TABLE_VIEWS.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                textValue={option.title}
                className="items-start py-2.5"
              >
                <span className="flex flex-col gap-0.5 whitespace-normal">
                  <span className="font-medium leading-snug">
                    {option.title}
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-muted-foreground">
          {viewMeta.description}
        </p>
      </div>

      {query.isLoading ? <CardSkeleton className="h-72" /> : null}

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {query.isError && query.data ? (
        <StaleDataBanner
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data ? (
        <div
          className={`space-y-4 ${query.isFetching ? 'opacity-80 transition-opacity' : ''}`}
        >
          {sorted.length === 0 ? (
            <EmptyState
              title="No rows"
              description="This rollup has no current salary rows yet."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card/90">
                <AnalyticsRollupTable
                  view={view}
                  rows={pageRows}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {rangeStart.toLocaleString()}–
                    {rangeEnd.toLocaleString()} of{' '}
                    {sorted.length.toLocaleString()} · Page {safePage} of{' '}
                    {totalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() =>
                        updateParams({ page: String(safePage - 1) })
                      }
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={onPageKeyDown}
                        className="h-8 w-16"
                        aria-label="Go to page"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToPage}
                      >
                        Go
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        updateParams({ page: String(safePage + 1) })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
