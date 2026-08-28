import { ExpensesList } from '@store/store-view/expense'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function ExpensesPage() {
  //
  const t = useT()
  const { isStoreOwner, branchId } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined

  return <ExpensesList t={t} isStoreOwner={isStoreOwner} branchId={scopedBranchId} exchangeRate={exchangeRate} />
}
