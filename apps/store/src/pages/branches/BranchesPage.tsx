import { BranchesList } from '@store/store-view/branch'
import { useCurrentUser } from '@/entities/user'

export function BranchesPage() {
  //
  const { user: currentUser, isStoreOwner } = useCurrentUser()

  return <BranchesList currentUser={currentUser} isStoreOwner={isStoreOwner} />
}
