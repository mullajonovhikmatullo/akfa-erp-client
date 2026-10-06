import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useOpenFromList } from '@/shared/hooks/useListReturn'

export function TransfersPage() {
  //
  const openFromList = useOpenFromList()
  const { isStoreOwner, userBranchId, scopedBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return (
    <TransfersList
      isStoreOwner={isStoreOwner}
      userBranchId={isStoreOwner ? userBranchId : scopedBranchId}
      branchId={scopedBranchId}
      exchangeRate={exchangeRate}
      onOpenTransfer={(transferId) => openFromList(ROUTES.TRANSFER_DETAIL.replace(':transferId', transferId))}
    />
  )
}
