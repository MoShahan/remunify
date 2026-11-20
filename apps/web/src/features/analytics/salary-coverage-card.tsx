import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type SalaryCoverageCardProps = {
  withSalary: number
  withoutSalary: number
}

export function SalaryCoverageCard({
  withSalary,
  withoutSalary,
}: SalaryCoverageCardProps) {
  const total = withSalary + withoutSalary
  const coveredPct = total > 0 ? Math.round((withSalary / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary coverage</CardTitle>
        <CardDescription>
          Share of employees with a current salary on file.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-56 flex-col justify-center gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
            {coveredPct}%
          </p>
          <p className="text-sm text-muted-foreground">
            {withSalary.toLocaleString()} of {total.toLocaleString()} covered
          </p>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-md bg-muted"
          role="progressbar"
          aria-valuenow={coveredPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Salary coverage percentage"
        >
          <div
            className="h-full rounded-md bg-primary transition-[width]"
            style={{ width: `${coveredPct}%` }}
          />
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <li className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
            <span className="text-muted-foreground">With salary</span>
            <span className="font-medium tabular-nums">
              {withSalary.toLocaleString()}
            </span>
          </li>
          <li className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40"
              aria-hidden
            />
            <span className="text-muted-foreground">Without salary</span>
            <span className="font-medium tabular-nums">
              {withoutSalary.toLocaleString()}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
