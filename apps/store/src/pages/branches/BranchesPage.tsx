import { BranchesList } from '@store/store-view/branch'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function BranchesPage() {
  //
  const t = useT()
  const { user: currentUser, isSuper } = useCurrentUser()

  return <BranchesList t={t} currentUser={currentUser} isSuper={isSuper} />
}
