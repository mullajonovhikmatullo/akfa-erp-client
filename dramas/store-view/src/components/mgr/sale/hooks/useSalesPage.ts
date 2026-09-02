import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { SaleFilters } from '@store/store-stub'

export function useSalesPage(page: number, pageSize: number, filters?: SaleFilters) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSalesPage({ ...filters, page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 0,
  })
}
