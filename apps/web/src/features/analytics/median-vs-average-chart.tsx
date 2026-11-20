import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  CHART_MUTED,
  CHART_PRIMARY,
  chartCursorFill,
  chartTooltipContentStyle,
  formatAxisAmount,
} from '@/features/analytics/chart-theme'
import { formatMoneyAmount } from '@/lib/format-money'
import type { CurrencyAgg } from '@/lib/api'

type MedianVsAverageChartProps = {
  rows: CurrencyAgg[]
}

export function MedianVsAverageChart({ rows }: MedianVsAverageChartProps) {
  const data = rows.map((row) => ({
    currency: row.currency,
    average: Number(row.averageAmount),
    median: Number(row.medianAmount),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Median vs average by currency</CardTitle>
        <CardDescription>
          Skew check within each pay currency - amounts stay in native units
          (not mixed FX).
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No currency aggregates available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="currency" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={formatAxisAmount}
              />
              <Tooltip
                cursor={chartCursorFill}
                contentStyle={chartTooltipContentStyle}
                formatter={(value, name, item) => {
                  const code =
                    item != null &&
                    typeof item === 'object' &&
                    'payload' in item &&
                    item.payload != null &&
                    typeof item.payload === 'object' &&
                    'currency' in item.payload
                      ? String(
                          (item.payload as { currency?: string }).currency ??
                            '',
                        )
                      : ''
                  const label = typeof name === 'string' ? name : String(name)
                  if (typeof value !== 'number') {
                    return [String(value ?? ''), label]
                  }
                  return [
                    `${formatMoneyAmount(String(value), code || null)} ${code}`.trim(),
                    label,
                  ]
                }}
              />
              <Legend />
              <Bar
                dataKey="average"
                name="Average"
                fill={CHART_PRIMARY}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="median"
                name="Median"
                fill={CHART_MUTED}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
