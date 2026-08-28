import { PurchasesList } from '@store/store-view/purchase'
import { useCurrentUser } from '@/entities/user'
import { useUIStore } from '@/app/stores/ui.store'
import { useT } from '@/shared/lib/i18n'

export function PurchasesPage() {
  //
  const t = useT()
  const { isStoreOwner, branchId } = useCurrentUser()
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <PurchasesList t={t} isStoreOwner={isStoreOwner} userBranchId={branchId} activeBranchId={activeBranchId} exchangeRate={exchangeRate} />
}
