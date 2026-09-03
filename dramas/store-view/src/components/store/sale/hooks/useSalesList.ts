import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { SaleFilters } from '@store/store-stub'

export function useSalesList(filters?: SaleFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSales(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}
