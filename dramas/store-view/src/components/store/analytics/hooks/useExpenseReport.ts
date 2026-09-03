import { useQuery } from '@tanstack/react-query'
import { AnalyticsSeekApi } from '@store/store-stub'
import type { AnalyticsQuery } from '@store/store-stub'
import { liveAnalyticsQueryOptions } from './analyticsQueryOptions'

export function useExpenseReport(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.expenseReport(query)

  return useQuery({ queryKey, queryFn, ...liveAnalyticsQueryOptions })
}
