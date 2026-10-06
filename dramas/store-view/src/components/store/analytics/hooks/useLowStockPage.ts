import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AnalyticsSeekApi } from '@store/store-stub'
import type { LowStockPageQuery } from '@store/store-stub'

export function useLowStockPage(query: LowStockPageQuery, options: { enabled?: boolean } = {}) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.findLowStockPage(query)

  return useQuery({ queryKey, queryFn, placeholderData: keepPreviousData, enabled: options.enabled ?? true })
}
