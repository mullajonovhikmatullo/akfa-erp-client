import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { BatchFilters } from '@store/store-stub'

export function useStockBatchesPage(page: number, pageSize: number, filters?: BatchFilters) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchesPage({ ...filters, page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}
