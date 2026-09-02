import { useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'

export function useCustomerPhoneCheck(phone: string, branchId?: string, enabled = true) {
  //
  const { queryKey, queryFn } = CustomerSeekApi.fetch.checkCustomerPhone(phone, branchId)

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && Boolean(phone) && Boolean(branchId),
    staleTime: 0,
  })
}
