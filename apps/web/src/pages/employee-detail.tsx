import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { TimelineSkeleton } from '@/components/skeletons'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SalaryFormDialog } from '@/features/employees/salary-form-dialog'
import { employeeKeys, getEmployee } from '@/lib/api'

export default function EmployeeDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const query = useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const res = await getEmployee(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  })

  const employee = query.data
  const mode = employee?.salary ? 'raise' : 'create'

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/employees">
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>
      </Button>

      {query.isLoading ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <TimelineSkeleton />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {employee ? (
        <>
          <PageHeader
            title={employee.fullName}
            description={`${employee.employeeNumber} · ${employee.designation} · ${employee.department}`}
            actions={<StatusBadge status={employee.status} />}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Employee record</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ['Email', employee.email],
                    ['Joined', employee.joinedAt],
                    ['Country', employee.country],
                    ['Department', employee.department],
                    ['Designation', employee.designation],
                    ['Status', employee.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>Current salary</CardTitle>
                  <CardDescription>Latest effectiveFrom row</CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  {mode === 'create' ? 'Set salary' : 'Record raise'}
                </Button>
              </CardHeader>
              <CardContent>
                {employee.salary ? (
                  <div className="space-y-2">
                    <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                      <MoneyText
                        amount={employee.salary.amount}
                        currency={employee.salary.currency}
                      />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {employee.salary.period} · effective{' '}
                      {employee.salary.effectiveFrom}
                    </p>
                  </div>
                ) : (
                  <EmptyState
                    title="No salary yet"
                    description="Set the first annual salary for this employee."
                    className="border-0 bg-transparent p-0"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Salary history</CardTitle>
              <CardDescription>
                Newest first. Raises keep prior rows and insert a new current.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employee.salaryHistory.length === 0 ? (
                <EmptyState
                  title="No history"
                  description="Salary changes will appear here as a timeline."
                  className="border-0 bg-transparent p-0"
                />
              ) : (
                <ol className="relative space-y-0 border-l border-border ml-2">
                  {employee.salaryHistory.map((row, index) => (
                    <li key={row.id} className="relative pb-8 pl-6 last:pb-0">
                      <span
                        className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-card ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                      />
                      <p className="text-sm font-medium text-foreground">
                        {row.effectiveFrom}
                      </p>
                      <p className="mt-1 text-base tabular-nums">
                        <MoneyText
                          amount={row.amount}
                          currency={row.currency}
                        />
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.period}
                        {index === 0 ? ' · current' : null}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <SalaryFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            employeeId={employee.id}
            mode={mode}
            currentSalary={employee.salary}
            onSuccess={() => {
              void queryClient.invalidateQueries({
                queryKey: employeeKeys.detail(employee.id),
              })
              void queryClient.invalidateQueries({
                queryKey: employeeKeys.lists(),
              })
              void queryClient.invalidateQueries({
                queryKey: ['analytics'],
              })
            }}
          />
        </>
      ) : null}
    </div>
  )
}
