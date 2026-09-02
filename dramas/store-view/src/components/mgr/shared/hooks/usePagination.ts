import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

function readPositiveInteger(value: string | null, fallback: number) {
  //
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : fallback
}

export function usePagination(defaultPageSize = 10, paramPrefix = '') {
  //
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = `${paramPrefix}page`
  const pageSizeParam = `${paramPrefix}pageSize`

  const page = readPositiveInteger(searchParams.get(pageParam), 1)
  const pageSize = readPositiveInteger(searchParams.get(pageSizeParam), defaultPageSize)

  const onChange = useCallback(
    (newPage: number, newPageSize: number) => {
      //
      setSearchParams(
        (prev) => {
          //
          const next = new URLSearchParams(prev)
          next.set(pageParam, String(newPage))
          next.set(pageSizeParam, String(newPageSize))
          return next
        },
        { replace: true },
      )
    },
    [pageParam, pageSizeParam, setSearchParams],
  )

  const rowIndex = useCallback((index: number) => (page - 1) * pageSize + index + 1, [page, pageSize])

  return { page, pageSize, onChange, rowIndex }
}
