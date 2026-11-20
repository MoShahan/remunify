import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { STATUS_COLORS } from '@/features/analytics/chart-theme'

export type StatusPieSlice = {
  name: string
  value: number
}

type StatusPieChartProps = {
  data: StatusPieSlice[]
  /** Chart area height class; Dashboard uses a shorter pie than Analytics used to. */
  contentClassName?: string
  description?: string
}

export function StatusPieChart({
  data,
  contentClassName = 'flex h-56 flex-col gap-3',
  description = 'Headcount by employment status.',
}: StatusPieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active vs inactive</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
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
                {data.map((entry, index) => (
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
          {data.map((entry, index) => (
            <li key={entry.name} className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length],
                }}
                aria-hidden
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
