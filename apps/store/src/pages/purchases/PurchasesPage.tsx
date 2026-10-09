import { useStoreExchangeRate } from '@/shared/hooks/useStoreExchangeRate'
import { PurchasesList } from '@store/store-view/purchase'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useOpenFromList } from '@/shared/hooks/useListReturn'

export function PurchasesPage() {
  //
  const openFromList = useOpenFromList()
  const { isStoreOwner, userBranchId, activeBranchId } = useBranchScope()
  const exchangeRate = useStoreExchangeRate()

  return (
    <PurchasesList
      isStoreOwner={isStoreOwner}
      userBranchId={userBranchId}
      activeBranchId={activeBranchId}
      exchangeRate={exchangeRate}
      onOpenReceipt={(receiptId) => openFromList(ROUTES.PURCHASE_DETAIL.replace(':receiptId', receiptId))}
    />
  )
}
