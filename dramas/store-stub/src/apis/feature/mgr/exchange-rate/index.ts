import { http } from '@store/store-shared'
import type { ExchangeRate, UpdateExchangeRatePayload } from '../../../../models/domain/exchange-rate'

const findCurrentExchangeRate = () => http.get<ExchangeRate>('/exchange-rate').then((r) => r.data)

const updateExchangeRate = (data: UpdateExchangeRatePayload) =>
  http.put<ExchangeRate>('/exchange-rate', data).then((r) => r.data)

export const ExchangeRateSeekApi = {
  findCurrentExchangeRate,
  fetch: {
    findCurrentExchangeRate: () => ({
      queryKey: ['exchangeRate', 'findCurrentExchangeRate'] as const,
      queryFn: findCurrentExchangeRate,
    }),
  },
}

export const ExchangeRateFlowApi = {
  updateExchangeRate,
}
