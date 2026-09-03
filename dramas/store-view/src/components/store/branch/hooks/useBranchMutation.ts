import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BranchFlowApi } from '@store/store-stub'
import { branchKeys } from './branchKeys'

export function useBranchMutation() {
  //
  const queryClient = useQueryClient()
  const invalidateBranches = () => queryClient.invalidateQueries({ queryKey: branchKeys.all })

  const createBranch = useMutation({
    mutationFn: BranchFlowApi.createBranch,
    onSuccess: invalidateBranches,
  })

  const updateBranch = useMutation({
    mutationFn: BranchFlowApi.updateBranch,
    onSuccess: invalidateBranches,
  })

  const deleteBranch = useMutation({
    mutationFn: BranchFlowApi.deleteBranch,
    onSuccess: invalidateBranches,
  })

  return { createBranch, updateBranch, deleteBranch }
}
