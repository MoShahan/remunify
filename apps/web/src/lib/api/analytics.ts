import { apiJson } from './client'
import type { AnalyticsSummaryResponse } from './types'

export async function getAnalyticsSummary() {
  return apiJson<AnalyticsSummaryResponse>('/api/analytics/summary')
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
}
