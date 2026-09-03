import { useQuery } from '@tanstack/react-query'
import { ExpenseSeekApi } from '@store/store-stub'
import type { ExpenseFilters } from '@store/store-stub'

export function useExpenseCategorySummary(filters?: ExpenseFilters) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenseCategorySummary(filters)

  return useQuery({ queryKey, queryFn })
}
