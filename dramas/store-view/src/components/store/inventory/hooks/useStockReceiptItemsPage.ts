import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'

export function useStockReceiptItemsPage(receiptId: string | undefined, initialPageSize = 25) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const query = InventorySeekApi.fetch.findReceiptItemsPage(receiptId ?? '', page, pageSize)
  const result = useQuery({ ...query, enabled: Boolean(receiptId), staleTime: 2 * 60 * 1000 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])

  return { ...result, page, pageSize, onPageChange, resetPage }
}
