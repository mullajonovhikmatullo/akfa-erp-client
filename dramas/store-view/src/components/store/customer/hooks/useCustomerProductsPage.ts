import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'
import type { CustomerProductsPageQuery } from '@store/store-stub'
import { customerKeys } from './customerKeys'

export function useCustomerProductsPage(
  id: string | null,
  params: CustomerProductsPageQuery,
  options: { enabled?: boolean } = {},
) {
  //
  const query = id ? CustomerSeekApi.fetch.findCustomerProductsPage(id, params) : null

  return useQuery({
    queryKey: query?.queryKey ?? customerKeys.products(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Customer id is required'))),
    enabled: Boolean(id) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  })
}
