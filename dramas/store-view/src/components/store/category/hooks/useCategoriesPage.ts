import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CategorySeekApi } from '@store/store-stub'

export function useCategoriesPage(isActive?: boolean) {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategoriesPage({ page, pageSize, isActive })
  const query = useQuery({ queryKey, queryFn, staleTime: 1000 * 60 * 5 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { ...query, page, pageSize, onPageChange, resetPage, rowIndex }
}
