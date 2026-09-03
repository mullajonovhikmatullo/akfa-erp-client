import { useQuery } from '@tanstack/react-query'
import { BillingSeekApi } from '@store/store-stub'

export function useBillingPlansList() {
  //
  return useQuery({
    ...BillingSeekApi.fetch.listPublicPlans(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })
}

