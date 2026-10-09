import { useExchangeRateSummary } from '@store/store-view/exchange-rate'

export function useStoreExchangeRate(): number {
  //
  const { data } = useExchangeRateSummary()
  return data?.usdToUzsRate ?? 0
}
