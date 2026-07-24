import { ExpensesList } from '@store/store-view/expense'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function ExpensesPage() {
  //
  const t = useT()
  const { isSuper } = useCurrentUser()
  const exchangeRate = useUIStore((state) => state.exchangeRate)

  return <ExpensesList t={t} isSuper={isSuper} exchangeRate={exchangeRate} />
}
