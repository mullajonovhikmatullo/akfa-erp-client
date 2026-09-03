import { SalesList } from '@store/store-view/sale'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function SalesPage() {
  //
  const { isStoreOwner, scopedBranchId, userBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const saleFormBranchId = scopedBranchId ?? userBranchId

  return <SalesList isStoreOwner={isStoreOwner} userBranchId={saleFormBranchId} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
