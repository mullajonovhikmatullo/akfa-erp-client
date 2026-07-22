import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BranchFlowApi, BranchSeekApi } from '@erp/store-buddy-stub'
import type { BranchPayload } from '@erp/store-buddy-stub'

export const branchKeys = {
  all: ['branches'] as const,
  list: () => [...branchKeys.all, 'list'] as const,
}

export function useBranches() {
  //
  const { queryKey, queryFn } = BranchSeekApi.fetch.findBranches()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBranchesPage(page: number, pageSize: number) {
  //
  const { queryKey, queryFn } = BranchSeekApi.fetch.findBranchesPage({ page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateBranch() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: BranchFlowApi.createBranch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  })
}

export function useUpdateBranch() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BranchPayload> }) => BranchFlowApi.updateBranch({ id, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  })
}

export function useDeleteBranch() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: BranchFlowApi.deleteBranch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  })
}
