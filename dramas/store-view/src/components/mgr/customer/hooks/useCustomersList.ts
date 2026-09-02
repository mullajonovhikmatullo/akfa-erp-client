import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CustomerSeekApi } from '@store/store-stub'
import type { CustomerFilters } from '@store/store-stub'

export function useCustomersList(filters?: CustomerFilters) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = CustomerSeekApi.fetch.findCustomers(filters)
  const query = useQuery({ queryKey, queryFn })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { ...query, page, pageSize, onPageChange, resetPage, rowIndex }
}
