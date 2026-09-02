import { useMutation } from '@tanstack/react-query'
import { BillingFlowApi } from '@store/store-stub'

export function useBillingMutation() {
  //
  const submitPayment = useMutation({ mutationFn: BillingFlowApi.submitPayment })
  return { submitPayment }
}

