import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorState } from '@/components/error-state'
import { CurrencyCode, MoneyText } from '@/components/money-text'
import { PageHeader } from '@/components/page-header'
import { ScrollableTable } from '@/components/scrollable-table'
import { CardSkeleton, KpiSkeleton } from '@/components/skeletons'
import { StaleDataBanner } from '@/components/stale-data-banner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'

const STATUS_COLORS = ['hsl(262 52% 36%)', 'hsl(270 14% 72%)']

export default function AnalyticsPage() {
  const query = useAnalyticsSummary()
  const currencies = query.data?.byCurrency.map((row) => row.currency) ?? []
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>()
  const [prevCurrenciesKey, setPrevCurrenciesKey] = useState('')
  const currenciesKey = currencies.join(',')
  if (currenciesKey !== prevCurrenciesKey) {
    setPrevCurrenciesKey(currenciesKey)
    if (!selectedCurrency || !currencies.includes(selectedCurrency)) {
      setSelectedCurrency(currencies[0])
    }
  }

  const currency = selectedCurrency ?? currencies[0]

  const avgByCountry =
    query.data && currency
      ? query.data.byCountry
          .filter((row) => row.currency === currency)
          .map((row) => ({
            country: row.country,
            average: Number(row.averageAmount),
          }))
      : []

  const avgByDepartment =
    query.data && currency
      ? query.data.byDepartment
          .filter((row) => row.currency === currency)
          .map((row) => ({
            department: row.department,
            average: Number(row.averageAmount),
          }))
      : []

  const statusChart = query.data
    ? [
        { name: 'Active', value: query.data.headcount.active },
        { name: 'Inactive', value: query.data.headcount.inactive },
      ]
    : []

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
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
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
                    <XAxis
                      dataKey="currency"
                      tickLine={false}
                      axisLine={false}
                    />
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

            <Card>
              <CardHeader>
                <CardTitle>Active vs inactive</CardTitle>
                <CardDescription>Employment status mix.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={84}
                      paddingAngle={2}
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
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Average salary by country</CardTitle>
                <CardDescription>
                  Averages for one selected currency only - never mixed FX.
                </CardDescription>
              </div>
              <Select value={currency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-36" aria-label="Chart currency">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-72">
              {avgByCountry.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No country rows for {currency ?? 'this currency'}.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={avgByCountry}
                    margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="country"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickLine={false} axisLine={false} width={56} />
                    <Tooltip
                      cursor={{ fill: 'hsl(270 45% 95% / 0.7)' }}
                      formatter={(value) =>
                        typeof value === 'number'
                          ? value.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : String(value ?? '')
                      }
                    />
                    <Bar
                      dataKey="average"
                      fill="hsl(271 81% 56%)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average salary by department</CardTitle>
              <CardDescription>
                Same currency filter as the country chart ({currency ?? '-'}).
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {avgByDepartment.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No department rows for {currency ?? 'this currency'}.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={avgByDepartment}
                    margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="department"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickLine={false} axisLine={false} width={56} />
                    <Tooltip
                      cursor={{ fill: 'hsl(270 45% 95% / 0.7)' }}
                      formatter={(value) =>
                        typeof value === 'number'
                          ? value.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })
                          : String(value ?? '')
                      }
                    />
                    <Bar
                      dataKey="average"
                      fill="hsl(262 52% 36%)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Average</TableHead>
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
                          <TableCell>
                            <MoneyText
                              amount={row.averageAmount}
                              currency={row.currency}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollableTable>
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
                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Average</TableHead>
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
                          <TableCell>
                            <MoneyText
                              amount={row.averageAmount}
                              currency={row.currency}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollableTable>
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
