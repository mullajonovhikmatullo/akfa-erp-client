import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'

export function useSaleSettings() {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSaleSettings()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 60_000,
  })
}
