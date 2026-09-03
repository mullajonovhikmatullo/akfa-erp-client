import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'
import type { ProductListParams } from '@store/store-stub'

export function useProductsList(filters?: ProductListParams) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProducts(filters)

  return useQuery({ queryKey, queryFn })
}
