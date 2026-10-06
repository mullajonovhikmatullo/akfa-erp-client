import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type ListReturnState = { from?: string } | null

export function useOpenFromList() {
  //
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (path: string) => navigate(path, { state: { from: `${location.pathname}${location.search}` } }),
    [location.pathname, location.search, navigate],
  )
}

export function useBackToList(listPath: string) {
  //
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as ListReturnState)?.from

  return useCallback(() => {
    //
    const target = from && from.startsWith(listPath) ? from : listPath
    navigate(target)
  }, [from, listPath, navigate])
}
