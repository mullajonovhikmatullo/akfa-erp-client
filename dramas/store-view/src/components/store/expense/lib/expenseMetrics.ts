import type { Expense, ExpenseCategory, ExpenseCategorySummaryData } from '@store/store-stub'

interface ExpenseMetricsOptions {
  expenses: Expense[]
  categories: ExpenseCategory[]
  summary?: ExpenseCategorySummaryData
  kpiCategoryLimit: number
  otherLabel: string
}

export interface ExpenseMetricItem {
  id: string
  name: string
  total: number
}

export function getExpenseMetrics({
  expenses,
  categories,
  summary,
  kpiCategoryLimit,
  otherLabel,
}: ExpenseMetricsOptions) {
  //
  const categoryTotals = new Map<string, number>()
  let fallbackGrandTotal = 0
  for (const expense of expenses) {
    fallbackGrandTotal += expense.amount
    categoryTotals.set(expense.category.id, (categoryTotals.get(expense.category.id) ?? 0) + expense.amount)
  }

  const fallbackByCategory = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      total: categoryTotals.get(category.id) ?? 0,
    }))
    .filter((category) => category.total > 0)
    .sort((left, right) => right.total - left.total)
  const byCategory: ExpenseMetricItem[] = summary
    ? summary.categories.map((category) => ({
        id: category.categoryId,
        name: category.categoryName,
        total: category.amount,
      }))
    : fallbackByCategory
  const fallbackKpiCategories =
    byCategory.length > kpiCategoryLimit
      ? [
          ...byCategory.slice(0, kpiCategoryLimit - 1),
          {
            id: 'other-expense-categories',
            name: otherLabel,
            total: byCategory
              .slice(kpiCategoryLimit - 1)
              .reduce((sum, category) => sum + category.total, 0),
          },
        ]
      : byCategory
  const kpiCategories: ExpenseMetricItem[] = summary
    ? summary.kpiCategories.map((category) => ({
        id: category.isOther ? 'other-expense-categories' : category.categoryId,
        name: category.isOther ? otherLabel : category.categoryName,
        total: category.amount,
      }))
    : fallbackKpiCategories

  return {
    grandTotal: summary?.total ?? fallbackGrandTotal,
    byCategory,
    kpiCategories,
  }
}
