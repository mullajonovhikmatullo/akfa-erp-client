import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { BatchFilters } from '@store/store-stub'

export function useStockBatchSummary(filters?: Pick<BatchFilters, 'branchId'>) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchSummary(filters)

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 0,
  })
}
