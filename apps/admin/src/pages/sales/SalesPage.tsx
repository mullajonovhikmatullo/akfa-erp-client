import { SalesList } from '@erp/store-buddy-view/sale'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function SalesPage() {
  //
  const t = useT()
  const { isSuper, branchId } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <SalesList t={t} isSuper={isSuper} userBranchId={branchId} exchangeRate={exchangeRate} />
}
