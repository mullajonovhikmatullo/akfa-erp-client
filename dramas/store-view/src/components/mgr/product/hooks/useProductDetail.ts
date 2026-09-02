import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

export function useProductDetail(id: string | null) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProduct(id ?? '')

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(id),
  })
}
