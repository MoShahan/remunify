import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { ErrorState } from '@/components/error-state'
import { MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { KpiSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'
import { useExportActions } from '@/features/export/use-export'

function Kpi({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-sans text-3xl tabular-nums tracking-tight">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export default function DashboardPage() {
  const query = useAnalyticsSummary()
  const { exporting, exportCsv, exportXlsx } = useExportActions()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Headcount and current compensation summaries for ACME - per currency, never mixed."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => void exportCsv()}
            >
              <Download className="h-4 w-4" />
              {exporting === 'csv' ? 'Preparing…' : 'CSV'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => void exportXlsx()}
            >
              <Download className="h-4 w-4" />
              {exporting === 'xlsx' ? 'Preparing…' : 'Excel'}
            </Button>
          </>
        }
      />

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {query.data ? (
        <div
          className={`space-y-6 ${query.isFetching ? 'opacity-80 transition-opacity' : ''}`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Total headcount" value={query.data.headcount.total} />
            <Kpi
              label="Active"
              value={query.data.headcount.active}
              hint="Currently employed"
            />
            <Kpi
              label="Inactive"
              value={query.data.headcount.inactive}
              hint="Not currently active"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>By currency</CardTitle>
                <CardDescription>
                  Current salaries only - totals stay in their own currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Median</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data.byCurrency.map((row) => (
                      <TableRow key={row.currency}>
                        <TableCell className="font-medium">
                          {row.currency}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.employeeCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <MoneyText amount={row.totalAmount} />
                        </TableCell>
                        <TableCell>
                          <MoneyText amount={row.averageAmount} />
                        </TableCell>
                        <TableCell>
                          <MoneyText amount={row.medianAmount} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-brand-muted/40">
              <CardHeader>
                <CardTitle>Company-wide (USD)</CardTitle>
                <CardDescription>
                  {query.data.companyWideUsd.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                  <MoneyText
                    amount={query.data.companyWideUsd.totalAmountUsd}
                    currency="USD"
                  />
                </p>
                <p className="text-sm text-muted-foreground">
                  {query.data.companyWideUsd.employeeCount.toLocaleString()}{' '}
                  employees with current salary
                  {query.data.companyWideUsd.ratesAsOf
                    ? ` · rates as of ${query.data.companyWideUsd.ratesAsOf}`
                    : null}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/employees">Browse employees</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/analytics">Open analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
