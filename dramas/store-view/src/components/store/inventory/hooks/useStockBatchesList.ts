import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { BatchFilters } from '@store/store-stub'

export function useStockBatchesList(filters?: BatchFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatches(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}
