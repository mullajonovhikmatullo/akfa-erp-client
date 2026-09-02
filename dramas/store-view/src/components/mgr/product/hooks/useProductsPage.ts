import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'
import type { ProductListParams } from '@store/store-stub'

export function useProductsPage(params: ProductListParams & { page: number; pageSize: number }) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductsPage(params)

  return useQuery({ queryKey, queryFn })
}
