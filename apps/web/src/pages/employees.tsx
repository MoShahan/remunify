import { useEffect, useMemo, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  listEmployees,
  type EmployeeListParams,
  type EmploymentStatus,
} from '@/lib/api'

function readParams(searchParams: URLSearchParams): EmployeeListParams {
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '20')
  const status = searchParams.get('status')
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
    sortBy:
      (searchParams.get('sortBy') as EmployeeListParams['sortBy']) ??
      'fullName',
    sortOrder:
      (searchParams.get('sortOrder') as EmployeeListParams['sortOrder']) ??
      'asc',
  }
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

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.set('page', '1')
    setSearchParams(next)
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
          onValueChange={(value) => updateParam('status', value)}
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
        <Input
          placeholder="Country"
          value={params.country ?? ''}
          onChange={(e) => updateParam('country', e.target.value || undefined)}
          className="lg:max-w-[10rem]"
          aria-label="Filter by country"
        />
        <Input
          placeholder="Department"
          value={params.department ?? ''}
          onChange={(e) =>
            updateParam('department', e.target.value || undefined)
          }
          className="lg:max-w-[12rem]"
          aria-label="Filter by department"
        />
        <Select
          value={`${params.sortBy ?? 'fullName'}:${params.sortOrder ?? 'asc'}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split(':')
            updateParam('sortBy', sortBy)
            updateParam('sortOrder', sortOrder)
          }}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullName:asc">Name A–Z</SelectItem>
            <SelectItem value="fullName:desc">Name Z–A</SelectItem>
            <SelectItem value="employeeNumber:asc">Number ↑</SelectItem>
            <SelectItem value="department:asc">Department</SelectItem>
            <SelectItem value="country:asc">Country</SelectItem>
            <SelectItem value="createdAt:desc">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? <DataTableSkeleton /> : null}

      {query.isError ? (
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
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Department</TableHead>
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
                  <TableCell>{employee.country}</TableCell>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    updateParam('page', String(pagination.page - 1))
                  }
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    updateParam('page', String(pagination.page + 1))
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
