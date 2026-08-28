import { SalesList } from '@store/store-view/sale'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function SalesPage() {
  //
  const t = useT()
  const { isStoreOwner, branchId } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined
  const saleFormBranchId = scopedBranchId ?? branchId ?? undefined

  return <SalesList t={t} isStoreOwner={isStoreOwner} userBranchId={saleFormBranchId} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
