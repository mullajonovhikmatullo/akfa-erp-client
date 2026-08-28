import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function TransfersPage() {
  //
  const t = useT()
  const { isStoreOwner, branchId, user } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined

  return <TransfersList t={t} isStoreOwner={isStoreOwner} userBranchId={isStoreOwner ? (branchId ?? undefined) : scopedBranchId} branchId={scopedBranchId} userId={user?.id} exchangeRate={exchangeRate} />
}
