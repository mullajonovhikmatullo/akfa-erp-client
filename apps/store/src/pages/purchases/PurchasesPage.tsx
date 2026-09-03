import { PurchasesList } from '@store/store-view/purchase'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function PurchasesPage() {
  //
  const { isStoreOwner, userBranchId, activeBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <PurchasesList isStoreOwner={isStoreOwner} userBranchId={userBranchId} activeBranchId={activeBranchId} exchangeRate={exchangeRate} />
}
