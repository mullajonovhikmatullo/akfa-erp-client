import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { SalePageQuery } from '@store/store-stub'

export function useCustomerSalesPage(
  params: SalePageQuery & { customerId: string },
  options: { enabled?: boolean } = {},
) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSalesPage(params)

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(params.customerId) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  })
}
