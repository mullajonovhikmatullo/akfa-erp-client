import { Navigate, useParams } from 'react-router-dom'
import { TransferDetailPanel } from '@store/store-view/transfer'
import { ROUTES } from '@/shared/config/routes'
import { useBackToList } from '@/shared/hooks/useListReturn'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function TransferDetailPage() {
  //
  const { transferId } = useParams<{ transferId: string }>()
  const backToList = useBackToList(ROUTES.TRANSFERS)
  const { isStoreOwner, userBranchId, scopedBranchId, user } = useBranchScope()

  if (!transferId) return <Navigate to={ROUTES.TRANSFERS} replace />

  return (
    <TransferDetailPanel
      key={transferId}
      transferId={transferId}
      isStoreOwner={isStoreOwner}
      userBranchId={isStoreOwner ? userBranchId : scopedBranchId}
      userId={user?.id}
      onBack={backToList}
    />
  )
}
