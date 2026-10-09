import { useStoreExchangeRate } from '@/shared/hooks/useStoreExchangeRate'
import { SalesList } from '@store/store-view/sale'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function SalesPage() {
  //
  const { isStoreOwner, scopedBranchId, userBranchId } = useBranchScope()
  const exchangeRate = useStoreExchangeRate()
  const saleFormBranchId = scopedBranchId ?? userBranchId

  return <SalesList isStoreOwner={isStoreOwner} userBranchId={saleFormBranchId} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
