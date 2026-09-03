import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function TransfersPage() {
  //
  const { isStoreOwner, userBranchId, scopedBranchId, user } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <TransfersList isStoreOwner={isStoreOwner} userBranchId={isStoreOwner ? userBranchId : scopedBranchId} branchId={scopedBranchId} userId={user?.id} exchangeRate={exchangeRate} />
}
