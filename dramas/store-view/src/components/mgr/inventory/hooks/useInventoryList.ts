import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { InventoryFilters } from '@store/store-stub'

export function useInventoryList(filters?: InventoryFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findInventoryRecords(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}
