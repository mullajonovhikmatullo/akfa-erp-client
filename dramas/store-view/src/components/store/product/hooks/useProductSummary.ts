import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'

export function useProductSummary() {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductSummary()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}
