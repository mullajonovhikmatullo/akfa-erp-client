import { useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'
import { customerKeys } from './customerKeys'

export function useCustomerDetail(id: string | null) {
  //
  const query = id ? CustomerSeekApi.fetch.findCustomer(id) : null

  return useQuery({
    queryKey: query?.queryKey ?? customerKeys.detail(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Customer id is required'))),
    enabled: Boolean(id),
  })
}
