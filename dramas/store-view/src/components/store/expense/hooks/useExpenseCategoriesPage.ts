import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ExpenseSeekApi } from '@store/store-stub'
import type { ExpenseCategoryPageQuery } from '@store/store-stub'

export function useExpenseCategoriesPage(query: ExpenseCategoryPageQuery, options: { enabled?: boolean } = {}) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenseCategoriesPage(query)

  return useQuery({ queryKey, queryFn, placeholderData: keepPreviousData, enabled: options.enabled ?? true })
}
