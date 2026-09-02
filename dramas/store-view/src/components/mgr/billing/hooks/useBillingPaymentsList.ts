import { useQuery } from '@tanstack/react-query'
import { BillingSeekApi } from '@store/store-stub'

export function useBillingPaymentsList() {
  //
  return useQuery({
    ...BillingSeekApi.fetch.listPayments(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

