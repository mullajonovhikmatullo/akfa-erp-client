import { useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'
import type { CustomerScopeQuery } from '@store/store-stub'
import { customerKeys } from './customerKeys'

export function useCustomerSummary(id: string | null, params?: CustomerScopeQuery) {
  //
  const query = id ? CustomerSeekApi.fetch.findCustomerSummary(id, params) : null

  return useQuery({
    queryKey: query?.queryKey ?? customerKeys.summary(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Customer id is required'))),
    enabled: Boolean(id),
  })
}
