import { ExpensesList } from '@store/store-view/expense'
import { useUIStore } from '@/app/stores/ui.store'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function ExpensesPage() {
  //
  const t = useT()
  const { isStoreOwner, scopedBranchId } = useBranchScope()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <ExpensesList t={t} isStoreOwner={isStoreOwner} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
