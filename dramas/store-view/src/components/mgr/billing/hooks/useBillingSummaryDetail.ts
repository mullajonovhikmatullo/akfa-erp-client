import { useQuery } from '@tanstack/react-query'
import { BillingSeekApi } from '@store/store-stub'

export function useBillingSummaryDetail() {
  //
  return useQuery({
    ...BillingSeekApi.fetch.summary(),
    refetchInterval: 30_000,
  })
}

