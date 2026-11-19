import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CountryFlag } from '@/components/country-flag'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { DataTableSkeleton } from '@/components/skeletons'
import { StatusBadge } from '@/components/status-badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import {
  employeeKeys,
  getEmployee,
  getEmployeeFacets,
  listEmployees,
  type EmployeeListParams,
  type EmploymentStatus,
} from '@/lib/api'
import { cn } from '@/lib/utils'

type SortableColumn = 'fullName' | 'employeeNumber' | 'department'

function readParams(searchParams: URLSearchParams): EmployeeListParams {
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '20')
  const status = searchParams.get('status')
  const sortBy = searchParams.get('sortBy') as EmployeeListParams['sortBy']
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    search: searchParams.get('search') ?? undefined,
    country: searchParams.get('country') ?? undefined,
    department: searchParams.get('department') ?? undefined,
    status:
      status === 'ACTIVE' || status === 'INACTIVE'
        ? (status as EmploymentStatus)
        : undefined,
    sortBy: sortBy ?? 'fullName',
    sortOrder:
      (searchParams.get('sortOrder') as EmployeeListParams['sortOrder']) ??
      'asc',
  }
}

function SortableTableHead({
  label,
  column,
  activeColumn,
  sortOrder,
  onSort,
}: {
  label: string
  column: SortableColumn
  activeColumn: string | undefined
  sortOrder: 'asc' | 'desc' | undefined
  onSort: (column: SortableColumn) => void
}) {
  const active = activeColumn === column
  return (
    <TableHead>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        {active ? (
          sortOrder === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          )
        ) : null}
      </button>
    </TableHead>
  )
}

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = useMemo(() => readParams(searchParams), [searchParams])
  const urlSearch = params.search ?? ''

  const [searchInput, setSearchInput] = useState(urlSearch)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch)
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch)
    setSearchInput(urlSearch)
  }

  const [pageInput, setPageInput] = useState(String(params.page ?? 1))
  const [prevPage, setPrevPage] = useState(params.page ?? 1)
  if ((params.page ?? 1) !== prevPage) {
    setPrevPage(params.page ?? 1)
    setPageInput(String(params.page ?? 1))
  }

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    const current = urlSearch
    if (debouncedSearch === current) return
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    next.set('page', '1')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, urlSearch, searchParams, setSearchParams])

  const queryParams: EmployeeListParams = {
    ...params,
    search: debouncedSearch || undefined,
  }

  const query = useQuery({
    queryKey: employeeKeys.list(queryParams),
    queryFn: () => listEmployees(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  const facetsQuery = useQuery({
    queryKey: employeeKeys.facets(),
    queryFn: async () => {
      const res = await getEmployeeFacets()
      return res.data
    },
    staleTime: 60_000,
  })

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    let resetsPage = false
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all') next.delete(key)
      else next.set(key, value)
      if (key !== 'page') resetsPage = true
    }
    if (resetsPage && !('page' in updates)) next.set('page', '1')
    setSearchParams(next)
  }

  const handleSort = (column: SortableColumn) => {
    const current = params.sortBy ?? 'fullName'
    const currentOrder = params.sortOrder ?? 'asc'
    if (current === column) {
      updateParams({
        sortBy: column,
        sortOrder: currentOrder === 'asc' ? 'desc' : 'asc',
      })
      return
    }
    updateParams({ sortBy: column, sortOrder: 'asc' })
  }

  const goToPage = () => {
    const totalPages = query.data?.pagination.totalPages ?? 1
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

  const pagination = query.data?.pagination

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Search and filter the directory. Table shows current salary only."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          placeholder="Search name, employee number, or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="lg:max-w-sm"
          aria-label="Search employees"
        />
        <Select
          value={params.status ?? 'all'}
          onValueChange={(value) => updateParams({ status: value })}
        >
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={params.country ?? 'all'}
          onValueChange={(value) => updateParams({ country: value })}
        >
          <SelectTrigger
            className="w-full lg:w-52"
            aria-label="Filter by country"
          >
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {(facetsQuery.data?.countries ?? []).map((country) => (
              <SelectItem key={country} value={country}>
                <CountryFlag country={country} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={params.department ?? 'all'}
          onValueChange={(value) => updateParams({ department: value })}
        >
          <SelectTrigger
            className="w-full lg:w-48"
            aria-label="Filter by department"
          >
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {(facetsQuery.data?.departments ?? []).map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? <DataTableSkeleton /> : null}

      {query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {query.data && query.data.data.length === 0 ? (
        <EmptyState
          title="No employees match"
          description="Try clearing search or filters."
        />
      ) : null}

      {query.data && query.data.data.length > 0 ? (
        <div
          className={`overflow-hidden rounded-xl border border-border/80 bg-card/90 ${query.isFetching ? 'opacity-80 transition-opacity' : ''}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  label="Name"
                  column="fullName"
                  activeColumn={params.sortBy}
                  sortOrder={params.sortOrder}
                  onSort={handleSort}
                />
                <SortableTableHead
                  label="Number"
                  column="employeeNumber"
                  activeColumn={params.sortBy}
                  sortOrder={params.sortOrder}
                  onSort={handleSort}
                />
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <SortableTableHead
                  label="Department"
                  column="department"
                  activeColumn={params.sortBy}
                  sortOrder={params.sortOrder}
                  onSort={handleSort}
                />
                <TableHead>Status</TableHead>
                <TableHead>Current salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.data.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  onMouseEnter={() => {
                    void queryClient.prefetchQuery({
                      queryKey: employeeKeys.detail(employee.id),
                      queryFn: async () => {
                        const res = await getEmployee(employee.id)
                        return res.data
                      },
                    })
                  }}
                >
                  <TableCell className="font-medium">
                    <Link
                      to={`/employees/${employee.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {employee.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {employee.employeeNumber}
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                    {employee.email}
                  </TableCell>
                  <TableCell>
                    <CountryFlag country={employee.country} />
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <StatusBadge status={employee.status} />
                  </TableCell>
                  <TableCell>
                    <MoneyText
                      amount={employee.salary?.amount}
                      currency={employee.salary?.currency}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination ? (
            <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ·{' '}
                {pagination.total.toLocaleString()} employees
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    updateParams({ page: String(pagination.page - 1) })
                  }
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
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
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    updateParams({ page: String(pagination.page + 1) })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
