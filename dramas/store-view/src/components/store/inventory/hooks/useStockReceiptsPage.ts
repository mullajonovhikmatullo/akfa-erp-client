import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { ReceiptPageQuery } from '@store/store-stub'

type StockReceiptFilters = Omit<ReceiptPageQuery, 'page' | 'pageSize'>

export function useStockReceiptsPage(filters: StockReceiptFilters) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = InventorySeekApi.fetch.findReceiptsPage({ ...filters, page, pageSize })
  const query = useQuery({ queryKey, queryFn, staleTime: 0 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { ...query, page, pageSize, onPageChange, resetPage, rowIndex }
}
