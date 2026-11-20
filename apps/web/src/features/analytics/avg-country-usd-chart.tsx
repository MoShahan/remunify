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
  CHART_SECONDARY,
  chartCursorFill,
  formatAxisAmount,
} from '@/features/analytics/chart-theme'
import { formatMoneyAmount } from '@/lib/format-money'
import type { AnalyticsSummary } from '@/lib/api'

type AvgCountryUsdChartProps = {
  rows: AnalyticsSummary['averageByCountryUsd']
  ratesAsOf: string | null
}

export function AvgCountryUsdChart({
  rows,
  ratesAsOf,
}: AvgCountryUsdChartProps) {
  const data = rows.map((row) => ({
    country: row.country,
    averageUsd: Number(row.averageAmountUsd),
    employees: row.employeeCount,
  }))
  const height = Math.max(320, data.length * 28)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average salary by country</CardTitle>
        <CardDescription>
          Every country with a current salary, converted to USD with demo FX so
          averages stay comparable.
          {ratesAsOf ? ` Rates as of ${ratesAsOf}.` : null}
        </CardDescription>
      </CardHeader>
      <CardContent style={{ height }}>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No country averages available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAxisAmount}
              />
              <YAxis
                type="category"
                dataKey="country"
                width={120}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip
                cursor={chartCursorFill}
                formatter={(value) =>
                  typeof value === 'number'
                    ? `$${formatMoneyAmount(String(value), 'USD')}`
                    : String(value ?? '')
                }
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="averageUsd"
                name="Avg USD"
                fill={CHART_SECONDARY}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
