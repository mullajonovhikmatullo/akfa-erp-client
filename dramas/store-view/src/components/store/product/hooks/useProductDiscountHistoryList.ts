import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

export function useProductDiscountHistoryList(productId: string | null) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductDiscountHistory(productId ?? '')

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(productId),
    staleTime: 30_000,
  })
}
