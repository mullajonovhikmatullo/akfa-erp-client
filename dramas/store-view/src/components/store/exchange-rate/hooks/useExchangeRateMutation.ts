import type { StoreTranslator } from '@store/store-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExchangeRateFlowApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { exchangeRateKeys } from './exchangeRateKeys'

export function useExchangeRateMutation(t: StoreTranslator) {
  //
  const queryClient = useQueryClient()

  const updateExchangeRate = useMutation({
    mutationFn: ExchangeRateFlowApi.updateExchangeRate,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: exchangeRateKeys.all })
      toast.success(t('exchangeRate.updateSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'exchangeRate.updateError'))
    },
  })

  return { updateExchangeRate }
}
