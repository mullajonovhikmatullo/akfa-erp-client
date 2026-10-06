import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ExpenseSeekApi } from '@store/store-stub'
import type { ExpensePageQuery } from '@store/store-stub'

export function useExpensesPage(query: ExpensePageQuery) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpensesPage(query)

  return useQuery({ queryKey, queryFn, placeholderData: keepPreviousData })
}
