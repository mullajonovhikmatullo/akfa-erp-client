import type { Currency, Expense, ExpenseCategory } from '@store/store-shared'
import type {
  CreateExpenseCategoryRequest,
  CreateExpenseRequest,
  UpdateExpenseCategoryRequest,
} from '../../../contracts/backend.generated'

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

export type CreateExpensePayload = CreateExpenseRequest & { currency?: Currency }

export type CreateExpenseCategoryPayload = CreateExpenseCategoryRequest

export type UpdateExpenseCategoryPayload = UpdateExpenseCategoryRequest
