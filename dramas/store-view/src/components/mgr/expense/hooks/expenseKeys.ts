import type { ExpenseFilters } from '@store/store-stub'

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.all, 'list', filters] as const,
  categorySummaryRoot: () => [...expenseKeys.all, 'categorySummary'] as const,
  categorySummary: (filters?: ExpenseFilters) => [...expenseKeys.categorySummaryRoot(), filters] as const,
  categoriesRoot: () => [...expenseKeys.all, 'categories'] as const,
  categories: (includeInactive?: boolean) => [...expenseKeys.all, 'categories', includeInactive] as const,
}
