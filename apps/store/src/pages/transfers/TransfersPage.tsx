import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function TransfersPage() {
  //
  const t = useT()
  const { isStoreOwner, branchId, user } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <TransfersList t={t} isStoreOwner={isStoreOwner} userBranchId={branchId} userId={user?.id} exchangeRate={exchangeRate} />
}
