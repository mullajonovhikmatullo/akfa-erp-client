import { useQuery } from '@tanstack/react-query'
import { ExpenseSeekApi } from '@store/store-stub'
import type { ExpenseFilters } from '@store/store-stub'

export function useExpensesList(filters?: ExpenseFilters) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenses(filters)

  return useQuery({ queryKey, queryFn })
}
