import { PurchasesList } from '@store/store-view/purchase'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function PurchasesPage() {
  //
  const t = useT()
  const { isStoreOwner, userBranchId, activeBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <PurchasesList t={t} isStoreOwner={isStoreOwner} userBranchId={userBranchId} activeBranchId={activeBranchId} exchangeRate={exchangeRate} />
}
