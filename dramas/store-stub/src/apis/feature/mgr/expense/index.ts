import { http } from '@store/store-shared'
import type {
  CreateExpenseCategoryPayload,
  CreateExpensePayload,
  Expense,
  ExpenseCategory,
  ExpenseCategorySummaryData,
  ExpenseFilters,
  UpdateExpenseCategoryPayload,
} from '../../../../models/domain/expense'

type Raw = Record<string, unknown>

const parseExpense = (raw: Raw): Expense => ({
  ...(raw as unknown as Expense),
  amount: Number(raw.amount),
  currency: (raw.currency as Expense['currency']) ?? 'UZS',
  amountUsd: Number(raw.amountUsd ?? 0),
  usdToUzsRate: raw.usdToUzsRate != null ? Number(raw.usdToUzsRate) : null,
})

const findExpenses = (params?: ExpenseFilters) =>
  http.get('/expenses', { params }).then((response) => (response.data.data as Raw[]).map(parseExpense))

const findExpense = (id: string) => http.get(`/expenses/${id}`).then((response) => parseExpense(response.data.data))

const createExpense = (payload: CreateExpensePayload) => http.post('/expenses', payload).then((response) => parseExpense(response.data.data))

const deleteExpense = (id: string) => http.delete(`/expenses/${id}`)

const findExpenseCategorySummary = (params?: ExpenseFilters) =>
  http.get('/expenses/summary/categories', { params }).then((response) => response.data.data as ExpenseCategorySummaryData)

const findExpenseCategories = (includeInactive?: boolean) =>
  http
    .get('/expenses/categories', { params: includeInactive ? { includeInactive: true } : undefined })
    .then((response) => response.data.data as ExpenseCategory[])

const createExpenseCategory = (payload: CreateExpenseCategoryPayload) =>
  http.post('/expenses/categories', payload).then((response) => response.data.data as ExpenseCategory)

const updateExpenseCategory = ({ id, payload }: { id: string; payload: UpdateExpenseCategoryPayload }) =>
  http.patch(`/expenses/categories/${id}`, payload).then((response) => response.data.data as ExpenseCategory)

const deleteExpenseCategory = (id: string) => http.delete(`/expenses/categories/${id}`)

export const ExpenseSeekApi = {
  findExpenses,
  findExpense,
  findExpenseCategorySummary,
  findExpenseCategories,
  fetch: {
    findExpenses: (params?: ExpenseFilters) => ({
      queryKey: ['expenses', 'findExpenses', params] as const,
      queryFn: () => findExpenses(params),
    }),
    findExpenseCategories: (includeInactive?: boolean) => ({
      queryKey: ['expenses', 'categories', includeInactive] as const,
      queryFn: () => findExpenseCategories(includeInactive),
    }),
    findExpenseCategorySummary: (params?: ExpenseFilters) => ({
      queryKey: ['expenses', 'categorySummary', params] as const,
      queryFn: () => findExpenseCategorySummary(params),
    }),
  },
}

export const ExpenseFlowApi = {
  createExpense,
  deleteExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
}

export const expenseApi = {
  list: findExpenses,
  getById: findExpense,
  create: createExpense,
  remove: deleteExpense,
  categorySummary: findExpenseCategorySummary,
  listCategories: findExpenseCategories,
  createCategory: createExpenseCategory,
  updateCategory: (id: string, payload: UpdateExpenseCategoryPayload) => updateExpenseCategory({ id, payload }),
  deleteCategory: deleteExpenseCategory,
}
