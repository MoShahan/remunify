import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorState } from '@/components/error-state'
import { MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { KpiSkeleton } from '@/components/skeletons'
import { StaleDataBanner } from '@/components/stale-data-banner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RollupPreviewFooter } from '@/features/analytics/rollup-preview-footer'
import { PREVIEW_ROW_LIMIT } from '@/features/analytics/rollup-table-model'
import { AnalyticsRollupTable } from '@/features/analytics/rollup-tables'
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'
import { useExportActions } from '@/features/export/use-export'

const STATUS_COLORS = ['hsl(262 52% 36%)', 'hsl(270 14% 72%)']

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

  const statusChart = query.data
    ? [
        { name: 'Active', value: query.data.headcount.active },
        { name: 'Inactive', value: query.data.headcount.inactive },
      ]
    : []

  const currencyBars = query.data
    ? [...query.data.byCurrency]
        .sort((a, b) => b.employeeCount - a.employeeCount)
        .slice(0, 8)
        .map((row) => ({
          currency: row.currency,
          employees: row.employeeCount,
        }))
    : []

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
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : null}

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
          className={`space-y-6 ${query.isFetching ? 'opacity-80 transition-opacity' : ''}`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <Kpi
              label="With salary"
              value={query.data.headcount.withSalary}
              hint="Has a current salary row"
            />
            <Kpi
              label="Without salary"
              value={query.data.headcount.withoutSalary}
              hint="No salary on file"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active vs inactive</CardTitle>
                <CardDescription>
                  Headcount by employment status.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-56 flex-col gap-3">
                <div className="min-h-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={62}
                        paddingAngle={2}
                        label={({ value }) =>
                          typeof value === 'number'
                            ? value.toLocaleString()
                            : String(value ?? '')
                        }
                        labelLine={false}
                      >
                        {statusChart.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                  {statusChart.map((entry, index) => (
                    <li
                      key={entry.name}
                      className="inline-flex items-center gap-2"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[index % STATUS_COLORS.length],
                        }}
                        aria-hidden
                      />
                      <span className="text-muted-foreground">
                        {entry.name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {entry.value.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top currencies</CardTitle>
                <CardDescription>
                  Employee count by pay currency (current salaries).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currencyBars}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="currency"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={48}
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
                <AnalyticsRollupTable
                  view="currency"
                  rows={query.data.byCurrency.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=currency"
                total={query.data.byCurrency.length}
              />
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By country</CardTitle>
                <CardDescription>
                  Current salaries grouped by country and currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsRollupTable
                  view="country"
                  rows={query.data.byCountry.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=country"
                total={query.data.byCountry.length}
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By department</CardTitle>
                <CardDescription>
                  Current salaries grouped by department and currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsRollupTable
                  view="department"
                  rows={query.data.byDepartment.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=department"
                total={query.data.byDepartment.length}
              />
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
