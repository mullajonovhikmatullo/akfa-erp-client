import { useQuery } from '@tanstack/react-query'
import { ExpenseSeekApi } from '@store/store-stub'

export function useExpenseCategoriesList(includeInactive?: boolean) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenseCategories(includeInactive)

  return useQuery({ queryKey, queryFn })
}
