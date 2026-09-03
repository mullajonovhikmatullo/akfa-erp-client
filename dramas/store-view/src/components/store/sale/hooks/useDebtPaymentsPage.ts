import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { DebtPaymentFilters } from '@store/store-stub'

type DebtPaymentPageFilters = Omit<DebtPaymentFilters, 'page' | 'pageSize'>

export function useDebtPaymentsPage(filters: DebtPaymentPageFilters) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = SaleSeekApi.fetch.findDebtPayments({ ...filters, page, pageSize })
  const query = useQuery({ queryKey, queryFn, staleTime: 0 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])

  return { ...query, page, pageSize, onPageChange, resetPage }
}
