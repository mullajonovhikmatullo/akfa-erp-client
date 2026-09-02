import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { DebtPaymentFilters } from '@store/store-stub'

export function useDebtPaymentsList(filters: DebtPaymentFilters) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findDebtPayments(filters)

  return useQuery({ queryKey, queryFn, staleTime: 0 })
}
