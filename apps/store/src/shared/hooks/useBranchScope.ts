import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'

export function useBranchScope() {
  //
  const currentUser = useCurrentUser()
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const scopedBranchId = currentUser.isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : currentUser.branchId ?? undefined

  return {
    ...currentUser,
    activeBranchId,
    scopedBranchId,
    userBranchId: currentUser.branchId ?? undefined,
  }
}
