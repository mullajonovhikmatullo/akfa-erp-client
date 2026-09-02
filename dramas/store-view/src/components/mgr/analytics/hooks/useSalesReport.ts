import { useQuery } from '@tanstack/react-query'
import { AnalyticsSeekApi } from '@store/store-stub'
import type { AnalyticsQuery } from '@store/store-stub'
import { liveAnalyticsQueryOptions } from './analyticsQueryOptions'

export function useSalesReport(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.salesReport(query)

  return useQuery({ queryKey, queryFn, ...liveAnalyticsQueryOptions })
}
