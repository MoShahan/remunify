import { ArrowDown, ArrowUp } from 'lucide-react'
import { CurrencyCode, MoneyText } from '@/components/money-text'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CurrencyAgg } from '@/lib/api'
import { cn } from '@/lib/utils'
import type {
  CountryRollupRow,
  DepartmentRollupRow,
  RollupRow,
  RollupSortKey,
  TableViewId,
} from './rollup-table-model'

function SortableHead({
  label,
  column,
  activeColumn,
  sortOrder,
  onSort,
}: {
  label: string
  column: RollupSortKey
  activeColumn?: RollupSortKey
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: RollupSortKey) => void
}) {
  if (!onSort) {
    return <TableHead>{label}</TableHead>
  }
  const active = activeColumn === column
  return (
    <TableHead>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}`}
      >
        {label}
        {active ? (
          sortOrder === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          )
        ) : null}
      </button>
    </TableHead>
  )
}

type AnalyticsRollupTableProps = {
  view: TableViewId
  rows: RollupRow[]
  sortBy?: RollupSortKey
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: RollupSortKey) => void
  className?: string
}

export function AnalyticsRollupTable({
  view,
  rows,
  sortBy,
  sortOrder,
  onSort,
  className,
}: AnalyticsRollupTableProps) {
  const headProps = { activeColumn: sortBy, sortOrder, onSort }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            {view === 'currency' ? (
              <>
                <SortableHead
                  label="Currency"
                  column="currency"
                  {...headProps}
                />
                <SortableHead
                  label="Employees"
                  column="employeeCount"
                  {...headProps}
                />
                <SortableHead
                  label="Total"
                  column="totalAmount"
                  {...headProps}
                />
                <SortableHead
                  label="Average"
                  column="averageAmount"
                  {...headProps}
                />
                <SortableHead
                  label="Median"
                  column="medianAmount"
                  {...headProps}
                />
              </>
            ) : null}
            {view === 'country' ? (
              <>
                <SortableHead label="Country" column="label" {...headProps} />
                <SortableHead
                  label="Currency"
                  column="currency"
                  {...headProps}
                />
                <SortableHead
                  label="Employees"
                  column="employeeCount"
                  {...headProps}
                />
                <SortableHead
                  label="Total"
                  column="totalAmount"
                  {...headProps}
                />
                <SortableHead
                  label="Average"
                  column="averageAmount"
                  {...headProps}
                />
              </>
            ) : null}
            {view === 'department' ? (
              <>
                <SortableHead
                  label="Department"
                  column="label"
                  {...headProps}
                />
                <SortableHead
                  label="Currency"
                  column="currency"
                  {...headProps}
                />
                <SortableHead
                  label="Employees"
                  column="employeeCount"
                  {...headProps}
                />
                <SortableHead
                  label="Total"
                  column="totalAmount"
                  {...headProps}
                />
                <SortableHead
                  label="Average"
                  column="averageAmount"
                  {...headProps}
                />
              </>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            if (view === 'currency') {
              const r = row as CurrencyAgg
              return (
                <TableRow key={r.currency}>
                  <TableCell className="font-medium">
                    <CurrencyCode code={r.currency} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {r.employeeCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <MoneyText amount={r.totalAmount} currency={r.currency} />
                  </TableCell>
                  <TableCell>
                    <MoneyText amount={r.averageAmount} currency={r.currency} />
                  </TableCell>
                  <TableCell>
                    <MoneyText amount={r.medianAmount} currency={r.currency} />
                  </TableCell>
                </TableRow>
              )
            }
            if (view === 'country') {
              const r = row as CountryRollupRow
              return (
                <TableRow key={`${r.country}-${r.currency}`}>
                  <TableCell className="font-medium">{r.country}</TableCell>
                  <TableCell>
                    <CurrencyCode code={r.currency} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {r.employeeCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <MoneyText amount={r.totalAmount} currency={r.currency} />
                  </TableCell>
                  <TableCell>
                    <MoneyText amount={r.averageAmount} currency={r.currency} />
                  </TableCell>
                </TableRow>
              )
            }
            const r = row as DepartmentRollupRow
            return (
              <TableRow key={`${r.department}-${r.currency}`}>
                <TableCell className="font-medium">{r.department}</TableCell>
                <TableCell>
                  <CurrencyCode code={r.currency} />
                </TableCell>
                <TableCell className="tabular-nums">
                  {r.employeeCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <MoneyText amount={r.totalAmount} currency={r.currency} />
                </TableCell>
                <TableCell>
                  <MoneyText amount={r.averageAmount} currency={r.currency} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
