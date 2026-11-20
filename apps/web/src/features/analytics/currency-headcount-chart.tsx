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
  CHART_PRIMARY,
  chartCursorFill,
  chartTooltipContentStyle,
} from '@/features/analytics/chart-theme'
import type { CurrencyAgg } from '@/lib/api'

type CurrencyHeadcountChartProps = {
  rows: CurrencyAgg[]
}

export function CurrencyHeadcountChart({ rows }: CurrencyHeadcountChartProps) {
  const data = rows.map((row) => ({
    currency: row.currency,
    employees: row.employeeCount,
  }))

  return (
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
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="currency" tickLine={false} axisLine={false} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={chartCursorFill}
              contentStyle={chartTooltipContentStyle}
            />
            <Bar
              dataKey="employees"
              fill={CHART_PRIMARY}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
