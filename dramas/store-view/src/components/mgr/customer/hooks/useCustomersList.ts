import { useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'
import type { CustomerFilters } from '@store/store-stub'

export function useCustomersList(filters?: CustomerFilters) {
  //
  const { queryKey, queryFn } = CustomerSeekApi.fetch.findCustomers(filters)

  return useQuery({
    queryKey,
    queryFn,
  })
}
