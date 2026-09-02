import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function TransfersPage() {
  //
  const t = useT()
  const { isStoreOwner, userBranchId, scopedBranchId, user } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <TransfersList t={t} isStoreOwner={isStoreOwner} userBranchId={isStoreOwner ? userBranchId : scopedBranchId} branchId={scopedBranchId} userId={user?.id} exchangeRate={exchangeRate} />
}
