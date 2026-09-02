import { useQuery } from '@tanstack/react-query'
import { BranchSeekApi } from '@store/store-stub'

export function useBranchesPage(page: number, pageSize: number) {
  //
  const { queryKey, queryFn } = BranchSeekApi.fetch.findBranchesPage({ page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  })
}
