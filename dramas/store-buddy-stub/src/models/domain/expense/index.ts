import type { Currency, Expense, ExpenseCategory } from '@erp/erp-shared'

export type { Expense, ExpenseCategory }

export interface ExpenseFilters {
  branchId?: string
  categoryId?: string
  from?: string
  to?: string
  limit?: number
}

export interface ExpenseCategorySummaryItem {
  categoryId: string
  categoryName: string
  amount: number
  count: number
  isOther?: boolean
}

export interface ExpenseCategorySummaryData {
  total: number
  categories: ExpenseCategorySummaryItem[]
  kpiCategories: ExpenseCategorySummaryItem[]
}

export interface CreateExpensePayload {
  branchId?: string
  categoryId: string
  amount: number
  currency?: Currency
  amountUsd?: number
  usdToUzsRate?: number
  description?: string
  expenseDate?: string
}

export interface CreateExpenseCategoryPayload {
  name: string
  description?: string
}

export interface UpdateExpenseCategoryPayload {
  name?: string
  description?: string | null
  isActive?: boolean
}
