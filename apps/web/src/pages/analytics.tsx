import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorState } from '@/components/error-state'
import { CurrencyCode, MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { CardSkeleton, KpiSkeleton } from '@/components/skeletons'
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

export default function AnalyticsPage() {
  const query = useAnalyticsSummary()

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Per-currency compensation patterns. Company-wide USD uses fixed demo FX rates."
      />

      {query.isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
          <CardSkeleton className="h-72" />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {query.data ? (
        <div
          className={`space-y-6 ${query.isFetching ? 'opacity-80 transition-opacity' : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle>Employees by currency</CardTitle>
              <CardDescription>
                Headcount with a current salary, grouped by pay currency.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={query.data.byCurrency.map((row) => ({
                    currency: row.currency,
                    employees: row.employeeCount,
                  }))}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="currency" tickLine={false} axisLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(270 45% 95% / 0.7)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid hsl(270 14% 88%)',
                    }}
                  />
                  <Bar
                    dataKey="employees"
                    fill="hsl(262 52% 36%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By country</CardTitle>
                <CardDescription>
                  Totals stay with their currency - never summed across FX.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data.byCountry.map((row) => (
                      <TableRow key={`${row.country}-${row.currency}`}>
                        <TableCell className="font-medium">
                          {row.country}
                        </TableCell>
                        <TableCell>
                          <CurrencyCode code={row.currency} />
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.employeeCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <MoneyText
                            amount={row.totalAmount}
                            currency={row.currency}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By department</CardTitle>
                <CardDescription>
                  Department rollups grouped with currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data.byDepartment.map((row) => (
                      <TableRow key={`${row.department}-${row.currency}`}>
                        <TableCell className="font-medium">
                          {row.department}
                        </TableCell>
                        <TableCell>
                          <CurrencyCode code={row.currency} />
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {row.employeeCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <MoneyText
                            amount={row.totalAmount}
                            currency={row.currency}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-brand-muted/35">
            <CardHeader>
              <CardTitle>Company-wide USD</CardTitle>
              <CardDescription>
                {query.data.companyWideUsd.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold tabular-nums">
                <MoneyText
                  amount={query.data.companyWideUsd.totalAmountUsd}
                  currency="USD"
                />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {query.data.companyWideUsd.employeeCount.toLocaleString()}{' '}
                employees
                {query.data.companyWideUsd.ratesAsOf
                  ? ` · rates as of ${query.data.companyWideUsd.ratesAsOf}`
                  : null}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
