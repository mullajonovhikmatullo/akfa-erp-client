import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Branch } from '@store/store-stub'
import { useUIStore } from '@/app/stores/ui.store'
import { useAuthStore } from '@/entities/user'

export interface HeaderBranchFormValues {
  activeBranchId: string
}

export function useHeaderBranchSelection(branches: Branch[]) {
  //
  const user = useAuthStore((state) => state.user)
  const isStoreOwner = user?.role === 'store_owner'
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const setActiveBranch = useUIStore((state) => state.setActiveBranch)
  const activeBranch = branches.find((branch) => branch.id === activeBranchId)
  const userBranch = branches.find((branch) => branch.id === user?.branchId)
  const branchSelectValue = activeBranch ? activeBranchId : '__all__'
  const { control, reset } = useForm<HeaderBranchFormValues>({
    defaultValues: { activeBranchId: branchSelectValue },
  })

  useEffect(() => {
    //
    reset({ activeBranchId: branchSelectValue })
  }, [branchSelectValue, reset])

  return {
    activeBranch,
    control,
    isStoreOwner,
    setActiveBranch,
    userBranch,
  }
}
