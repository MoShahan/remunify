import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
  CHART_PRIMARY,
  chartCursorFill,
  formatAxisAmount,
} from '@/features/analytics/chart-theme'
import { formatMoneyAmount } from '@/lib/format-money'
import type { AnalyticsSummary } from '@/lib/api'

type DeptRow = AnalyticsSummary['byDepartment'][number]

type AvgDepartmentChartProps = {
  rows: DeptRow[]
  currencies: string[]
  currency: string | undefined
  onCurrencyChange: (currency: string) => void
}

export function AvgDepartmentChart({
  rows,
  currencies,
  currency,
  onCurrencyChange,
}: AvgDepartmentChartProps) {
  const data =
    currency != null
      ? rows
          .filter((row) => row.currency === currency)
          .map((row) => ({
            department: row.department,
            average: Number(row.averageAmount),
          }))
      : []

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Average salary by department</CardTitle>
          <CardDescription>
            Native-currency averages for one selected currency only.
          </CardDescription>
        </div>
        <Select value={currency} onValueChange={onCurrencyChange}>
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
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No department rows for {currency ?? 'this currency'}.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 16, left: 8, bottom: 40 }}
              barCategoryGap="28%"
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
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={formatAxisAmount}
                domain={[0, 'auto']}
              />
              <Tooltip
                cursor={chartCursorFill}
                formatter={(value) =>
                  typeof value === 'number'
                    ? `${formatMoneyAmount(String(value), currency)} ${currency ?? ''}`
                    : String(value ?? '')
                }
              />
              <Bar
                dataKey="average"
                name="Average"
                fill={CHART_PRIMARY}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
