import { useStoreExchangeRate } from '@/shared/hooks/useStoreExchangeRate'
import { ExpensesList } from '@store/store-view/expense'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function ExpensesPage() {
  //
  const { isStoreOwner, scopedBranchId } = useBranchScope()
  const exchangeRate = useStoreExchangeRate()

  return <ExpensesList isStoreOwner={isStoreOwner} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
