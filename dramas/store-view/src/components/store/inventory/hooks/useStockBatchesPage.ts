import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { BatchFilters } from '@store/store-stub'

export function useStockBatchesPage(filters?: BatchFilters) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchesPage({ ...filters, page, pageSize })
  const query = useQuery({ queryKey, queryFn, staleTime: 2 * 60 * 1000 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { ...query, page, pageSize, onPageChange, resetPage, rowIndex }
}
