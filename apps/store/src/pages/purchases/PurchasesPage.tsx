import { PurchasesList } from '@store/store-view/purchase'
import { useUIStore } from '@/app/stores/ui.store'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useOpenFromList } from '@/shared/hooks/useListReturn'

export function PurchasesPage() {
  //
  const openFromList = useOpenFromList()
  const { isStoreOwner, userBranchId, activeBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

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
