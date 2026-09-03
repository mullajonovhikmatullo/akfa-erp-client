import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

export function useProductInventory(productId: string | null) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductInventory(productId ?? '')

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(productId),
    staleTime: 30_000,
  })
}
