import { PurchasesList } from '@store/store-view/purchase'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function PurchasesPage() {
  //
  const t = useT()
  const { isSuper, branchId } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <PurchasesList t={t} isSuper={isSuper} userBranchId={branchId} exchangeRate={exchangeRate} />
}
