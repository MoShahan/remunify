import { useState } from 'react'
import { ErrorState } from '@/components/error-state'
import { PageHeader } from '@/components/page-header'
import { CardSkeleton, KpiSkeleton } from '@/components/skeletons'
import { StaleDataBanner } from '@/components/stale-data-banner'
import { AvgCountryUsdChart } from '@/features/analytics/avg-country-usd-chart'
import { AvgDepartmentChart } from '@/features/analytics/avg-department-chart'
import { CompanyWideUsdCard } from '@/features/analytics/company-wide-usd-card'
import { CurrencyHeadcountChart } from '@/features/analytics/currency-headcount-chart'
import { MedianVsAverageChart } from '@/features/analytics/median-vs-average-chart'
import { OpenTablesLinks } from '@/features/analytics/open-tables-links'
import { TopCohortsCard } from '@/features/analytics/top-cohorts-card'
import { useAnalyticsSummary } from '@/features/analytics/use-analytics-summary'

export default function AnalyticsPage() {
  const query = useAnalyticsSummary()
  const currencies = query.data?.byCurrency.map((row) => row.currency) ?? []
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>()
  const [prevCurrenciesKey, setPrevCurrenciesKey] = useState('')
  const currenciesKey = currencies.join(',')
  if (currenciesKey !== prevCurrenciesKey) {
    setPrevCurrenciesKey(currenciesKey)
    if (!selectedCurrency || !currencies.includes(selectedCurrency)) {
      setSelectedCurrency(currencies[0])
    }
  }

  const currency = selectedCurrency ?? currencies[0]

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Per-currency compensation patterns. Company-wide USD uses fixed demo FX rates."
      />

      {query.isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
          <CardSkeleton className="h-72" />
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
          <CurrencyHeadcountChart rows={query.data.byCurrency} />
          <MedianVsAverageChart rows={query.data.byCurrency} />

          <AvgCountryUsdChart
            rows={query.data.averageByCountryUsd}
            ratesAsOf={query.data.companyWideUsd.ratesAsOf}
          />

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <AvgDepartmentChart
              rows={query.data.byDepartment}
              currencies={currencies}
              currency={currency}
              onCurrencyChange={setSelectedCurrency}
            />
            <TopCohortsCard
              rows={query.data.byDepartment}
              currency={currency}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <CompanyWideUsdCard
              data={query.data.companyWideUsd}
              className="border-primary/20 bg-brand-muted/35"
            />
            <OpenTablesLinks />
          </div>
        </div>
      ) : null}
    </div>
  )
}
