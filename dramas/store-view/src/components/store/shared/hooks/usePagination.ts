import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

const MAX_PAGE_SIZE = 100

function readPositiveInteger(value: string | null, fallback: number, maximum = Number.MAX_SAFE_INTEGER) {
  //
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, maximum)
}

export function usePagination(defaultPageSize = 10, paramPrefix?: string) {
  //
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = paramPrefix ? `${paramPrefix}Page` : 'page'
  const pageSizeParam = paramPrefix ? `${paramPrefix}PageSize` : 'pageSize'
  const page = readPositiveInteger(searchParams.get(pageParam), 1)
  const pageSize = readPositiveInteger(searchParams.get(pageSizeParam), defaultPageSize, MAX_PAGE_SIZE)

  const setPagination = useCallback(
    (nextPage: number, nextPageSize: number, replace = false) => {
      //
      setSearchParams((current) => {
        //
        const next = new URLSearchParams(current)
        if (nextPage > 1) next.set(pageParam, String(nextPage))
        else next.delete(pageParam)
        if (nextPageSize !== defaultPageSize) next.set(pageSizeParam, String(nextPageSize))
        else next.delete(pageSizeParam)
        return next
      }, { replace })
    },
    [defaultPageSize, pageParam, pageSizeParam, setSearchParams],
  )

  const changePage = useCallback(
    (nextPage: number, nextPageSize: number) => setPagination(nextPageSize === pageSize ? nextPage : 1, nextPageSize),
    [pageSize, setPagination],
  )
  const goToPage = useCallback((nextPage: number) => setPagination(nextPage, pageSize, true), [pageSize, setPagination])
  const resetPage = useCallback(() => {
    //
    if (page !== 1) setPagination(1, pageSize, true)
  }, [page, pageSize, setPagination])
  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { page, pageSize, changePage, goToPage, resetPage, rowIndex }
}
