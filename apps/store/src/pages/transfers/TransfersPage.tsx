import { useNavigate } from 'react-router-dom'
import { TransfersList } from '@store/store-view/transfer'
import { useUIStore } from '@/app/stores/ui.store'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function TransfersPage() {
  //
  const navigate = useNavigate()
  const { isStoreOwner, userBranchId, scopedBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return (
    <TransfersList
      isStoreOwner={isStoreOwner}
      userBranchId={isStoreOwner ? userBranchId : scopedBranchId}
      branchId={scopedBranchId}
      exchangeRate={exchangeRate}
      onOpenTransfer={(transferId) => navigate(ROUTES.TRANSFER_DETAIL.replace(':transferId', transferId))}
    />
  )
}
