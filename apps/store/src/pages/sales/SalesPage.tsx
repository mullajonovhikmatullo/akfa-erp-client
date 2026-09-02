import { SalesList } from '@store/store-view/sale'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function SalesPage() {
  //
  const t = useT()
  const { isStoreOwner, scopedBranchId, userBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const saleFormBranchId = scopedBranchId ?? userBranchId

  return <SalesList t={t} isStoreOwner={isStoreOwner} userBranchId={saleFormBranchId} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
