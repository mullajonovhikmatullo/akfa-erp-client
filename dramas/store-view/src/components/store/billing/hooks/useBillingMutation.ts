import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BillingFlowApi } from '@store/store-stub'
import { billingKeys } from './billingKeys'

export function useBillingMutation() {
  //
  const queryClient = useQueryClient()
  const submitPayment = useMutation({
    mutationFn: BillingFlowApi.submitPayment,
    onSettled: () => queryClient.invalidateQueries({ queryKey: billingKeys.all }),
  })
  return { submitPayment }
}
