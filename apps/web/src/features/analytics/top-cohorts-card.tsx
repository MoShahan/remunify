import { MoneyText } from '@/components/money-text'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AnalyticsSummary } from '@/lib/api'

type DeptRow = AnalyticsSummary['byDepartment'][number]

const TOP_N = 5

type TopCohortsCardProps = {
  rows: DeptRow[]
  currency: string | undefined
}

export function TopCohortsCard({ rows, currency }: TopCohortsCardProps) {
  const cohorts =
    currency == null
      ? []
      : [...rows]
          .filter((row) => row.currency === currency)
          .sort((a, b) => b.employeeCount - a.employeeCount)
          .slice(0, TOP_N)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top cohorts</CardTitle>
        <CardDescription>
          Largest departments by headcount
          {currency ? ` in ${currency}` : ''} - average pay stays native.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cohorts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No department cohorts for {currency ?? 'this currency'}.
          </p>
        ) : (
          <ol className="space-y-3">
            {cohorts.map((row, index) => (
              <li
                key={`${row.department}-${row.currency}`}
                className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    <span className="mr-2 tabular-nums text-muted-foreground">
                      {index + 1}.
                    </span>
                    {row.department}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.employeeCount.toLocaleString()} employees
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums">
                  <MoneyText
                    amount={row.averageAmount}
                    currency={row.currency}
                  />
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
