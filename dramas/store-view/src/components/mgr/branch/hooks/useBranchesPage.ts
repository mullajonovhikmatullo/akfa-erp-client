import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BranchSeekApi } from '@store/store-stub'

export function useBranchesPage() {
  //
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { queryKey, queryFn } = BranchSeekApi.fetch.findBranchesPage({ page, pageSize })
  const query = useQuery({ queryKey, queryFn, staleTime: 5 * 60 * 1000 })
  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    //
    setPage(nextPage)
    setPageSize(nextPageSize)
  }, [])
  const resetPage = useCallback(() => setPage(1), [])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { ...query, page, pageSize, onPageChange, resetPage, rowIndex }
}
