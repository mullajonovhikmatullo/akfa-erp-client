import { useQuery } from '@tanstack/react-query'
import { ExchangeRateSeekApi } from '@store/store-stub'

export function useExchangeRateSummary() {
  //
  const { queryKey, queryFn } = ExchangeRateSeekApi.fetch.findCurrentExchangeRate()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
