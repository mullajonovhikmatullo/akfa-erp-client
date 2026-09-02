import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import { saleKeys } from './saleKeys'

export function useSaleDetail(id: string | null) {
  //
  const query = id ? SaleSeekApi.fetch.findSale(id) : null

  return useQuery({
    queryKey: query?.queryKey ?? saleKeys.detail(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Sale id is required'))),
    enabled: Boolean(id),
  })
}
