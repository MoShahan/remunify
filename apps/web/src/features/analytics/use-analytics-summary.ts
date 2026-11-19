import { useQuery } from '@tanstack/react-query'
import { analyticsKeys, getAnalyticsSummary } from '@/lib/api'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: async () => {
      const response = await getAnalyticsSummary()
      return response.data
    },
    staleTime: 30_000,
  })
}
