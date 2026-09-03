import { ExpensesList } from '@store/store-view/expense'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function ExpensesPage() {
  //
  const { isStoreOwner, scopedBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <ExpensesList isStoreOwner={isStoreOwner} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
