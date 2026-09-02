import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProductSeekApi } from '@store/store-stub'
import type { ProductListParams } from '@store/store-stub'

export function useProductsPage(params: ProductListParams) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductsPage({ ...params, page, pageSize })
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
