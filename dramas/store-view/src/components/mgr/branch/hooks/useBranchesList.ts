import { useQuery } from '@tanstack/react-query'
import { BranchSeekApi } from '@store/store-stub'

export function useBranchesList() {
  //
  const { queryKey, queryFn } = BranchSeekApi.fetch.findBranches()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  })
}
