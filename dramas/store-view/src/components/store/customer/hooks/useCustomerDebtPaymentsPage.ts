import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { DebtPaymentFilters } from '@store/store-stub'

export function useCustomerDebtPaymentsPage(
  params: DebtPaymentFilters & { customerId: string; page: number; pageSize: number },
  options: { enabled?: boolean } = {},
) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findDebtPayments(params)

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(params.customerId) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  })
}
