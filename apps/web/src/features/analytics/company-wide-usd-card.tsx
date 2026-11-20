import { Link } from 'react-router-dom'
import { MoneyText } from '@/components/money-text'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AnalyticsSummary } from '@/lib/api'

type CompanyWideUsd = AnalyticsSummary['companyWideUsd']

type CompanyWideUsdCardProps = {
  data: CompanyWideUsd
  /** Dashboard shows jump links; Analytics is detail-only. */
  showActions?: boolean
  className?: string
}

export function CompanyWideUsdCard({
  data,
  showActions = false,
  className = 'border-primary/20 bg-brand-muted/40',
}: CompanyWideUsdCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {showActions ? 'Company-wide (USD)' : 'Company-wide USD'}
        </CardTitle>
        <CardDescription>{data.label}</CardDescription>
      </CardHeader>
      <CardContent className={showActions ? 'space-y-3' : undefined}>
        <p
          className={
            showActions
              ? 'font-display text-3xl font-semibold tabular-nums tracking-tight'
              : 'font-display text-3xl font-semibold tabular-nums'
          }
        >
          <MoneyText amount={data.totalAmountUsd} currency="USD" />
        </p>
        <p
          className={
            showActions
              ? 'text-sm text-muted-foreground'
              : 'mt-2 text-sm text-muted-foreground'
          }
        >
          {data.employeeCount.toLocaleString()}{' '}
          {showActions ? 'employees with current salary' : 'employees'}
          {data.ratesAsOf ? ` · rates as of ${data.ratesAsOf}` : null}
        </p>
        {showActions ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/employees">Browse employees</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/analytics">Open analytics</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
