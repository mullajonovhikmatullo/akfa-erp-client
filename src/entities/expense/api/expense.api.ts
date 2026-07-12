import { apiClient } from '@/shared/api/client';
import type { Expense, ExpenseCategory } from '@/shared/types/domain';

type Raw = Record<string, unknown>;

const parseExpense = (raw: Raw): Expense => ({
  ...(raw as unknown as Expense),
  amount: Number(raw.amount),
});

export interface ExpenseFilters {
  branchId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface ExpenseCategorySummaryItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  count: number;
  isOther?: boolean;
}

export interface ExpenseCategorySummaryData {
  total: number;
  categories: ExpenseCategorySummaryItem[];
  kpiCategories: ExpenseCategorySummaryItem[];
}

export interface CreateExpensePayload {
  branchId?: string;
  categoryId: string;
  amount: number;
  description?: string;
  expenseDate?: string;
}

export interface CreateExpenseCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryPayload {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export const expenseApi = {
  list: (params?: ExpenseFilters) =>
    apiClient.get('/expenses', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseExpense),
    ),

  getById: (id: string) =>
    apiClient.get(`/expenses/${id}`).then((r) => parseExpense(r.data.data)),

  create: (payload: CreateExpensePayload) =>
    apiClient.post('/expenses', payload).then((r) => parseExpense(r.data.data)),

  remove: (id: string) => apiClient.delete(`/expenses/${id}`),

  categorySummary: (params?: ExpenseFilters) =>
    apiClient
      .get('/expenses/summary/categories', { params })
      .then((r) => r.data.data as ExpenseCategorySummaryData),

  // Categories
  listCategories: (includeInactive?: boolean) =>
    apiClient
      .get('/expenses/categories', { params: includeInactive ? { includeInactive: true } : undefined })
      .then((r) => r.data.data as ExpenseCategory[]),

  createCategory: (payload: CreateExpenseCategoryPayload) =>
    apiClient.post('/expenses/categories', payload).then((r) => r.data.data as ExpenseCategory),

  updateCategory: (id: string, payload: UpdateExpenseCategoryPayload) =>
    apiClient.patch(`/expenses/categories/${id}`, payload).then((r) => r.data.data as ExpenseCategory),

  deleteCategory: (id: string) => apiClient.delete(`/expenses/categories/${id}`),
};
