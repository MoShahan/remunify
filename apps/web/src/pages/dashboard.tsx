import { Download } from 'lucide-react'
import { ErrorState } from '@/components/error-state'
import { PageHeader } from '@/components/page-header'
import { KpiSkeleton } from '@/components/skeletons'
import { StaleDataBanner } from '@/components/stale-data-banner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CompanyWideUsdCard } from '@/features/analytics/company-wide-usd-card'
import { RollupPreviewFooter } from '@/features/analytics/rollup-preview-footer'
import { PREVIEW_ROW_LIMIT } from '@/features/analytics/rollup-table-model'
import { AnalyticsRollupTable } from '@/features/analytics/rollup-tables'
import { SalaryCoverageCard } from '@/features/analytics/salary-coverage-card'
import { StatusPieChart } from '@/features/analytics/status-pie-chart'
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'
import { useExportActions } from '@/features/export/use-export'

function Kpi({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-sans text-3xl tabular-nums tracking-tight">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}

export default function DashboardPage() {
  const query = useAnalyticsSummary()
  const { exporting, exportCsv, exportXlsx } = useExportActions()

  const statusChart = query.data
    ? [
        { name: 'Active', value: query.data.headcount.active },
        { name: 'Inactive', value: query.data.headcount.inactive },
      ]
    : []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Headcount and current compensation summaries for ACME - per currency, never mixed."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => void exportCsv()}
            >
              <Download className="h-4 w-4" />
              {exporting === 'csv' ? 'Preparing…' : 'CSV'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => void exportXlsx()}
            >
              <Download className="h-4 w-4" />
              {exporting === 'xlsx' ? 'Preparing…' : 'Excel'}
            </Button>
          </>
        }
      />

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi label="Total headcount" value={query.data.headcount.total} />
            <Kpi
              label="Active"
              value={query.data.headcount.active}
              hint="Currently employed"
            />
            <Kpi
              label="Inactive"
              value={query.data.headcount.inactive}
              hint="Not currently active"
            />
            <Kpi
              label="With salary"
              value={query.data.headcount.withSalary}
              hint="Has a current salary row"
            />
            <Kpi
              label="Without salary"
              value={query.data.headcount.withoutSalary}
              hint="No salary on file"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <StatusPieChart data={statusChart} />
            <SalaryCoverageCard
              withSalary={query.data.headcount.withSalary}
              withoutSalary={query.data.headcount.withoutSalary}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>By currency</CardTitle>
                <CardDescription>
                  Current salaries only - totals stay in their own currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsRollupTable
                  view="currency"
                  rows={query.data.byCurrency.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=currency"
                total={query.data.byCurrency.length}
              />
            </Card>

            <CompanyWideUsdCard data={query.data.companyWideUsd} showActions />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By country</CardTitle>
                <CardDescription>
                  Current salaries grouped by country and currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsRollupTable
                  view="country"
                  rows={query.data.byCountry.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=country"
                total={query.data.byCountry.length}
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By department</CardTitle>
                <CardDescription>
                  Current salaries grouped by department and currency.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsRollupTable
                  view="department"
                  rows={query.data.byDepartment.slice(0, PREVIEW_ROW_LIMIT)}
                />
              </CardContent>
              <RollupPreviewFooter
                to="/tables?view=department"
                total={query.data.byDepartment.length}
              />
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
