import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExpenseFlowApi, ExpenseSeekApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'
import type {
  CreateExpenseCategoryPayload,
  CreateExpensePayload,
  ExpenseFilters,
  UpdateExpenseCategoryPayload,
} from '@store/store-stub'

type Translate = (key: string) => string

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.all, 'list', filters] as const,
  categorySummaryRoot: () => [...expenseKeys.all, 'categorySummary'] as const,
  categorySummary: (filters?: ExpenseFilters) => [...expenseKeys.categorySummaryRoot(), filters] as const,
  categoriesRoot: () => [...expenseKeys.all, 'categories'] as const,
  categories: (includeInactive?: boolean) => [...expenseKeys.all, 'categories', includeInactive] as const,
}

export function useExpenses(filters?: ExpenseFilters) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenses(filters)

  return useQuery({ queryKey, queryFn })
}

export function useExpenseCategories(includeInactive?: boolean) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenseCategories(includeInactive)

  return useQuery({ queryKey, queryFn })
}

export function useExpenseCategorySummary(filters?: ExpenseFilters) {
  //
  const { queryKey, queryFn } = ExpenseSeekApi.fetch.findExpenseCategorySummary(filters)

  return useQuery({ queryKey, queryFn })
}

export function useCreateExpense(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => ExpenseFlowApi.createExpense(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('expenses.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'expenses.createError'))
    },
  })
}

export function useDeleteExpense(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExpenseFlowApi.deleteExpense(id),
    onSuccess: async () => {
      //
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ])
      toast.success(t('expenses.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'expenses.deleteError'))
    },
  })
}

export function useCreateExpenseCategory(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) => ExpenseFlowApi.createExpenseCategory(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      toast.success(t('expenseCategories.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'expenseCategories.createError'))
    },
  })
}

export function useUpdateExpenseCategory(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpenseCategoryPayload }) =>
      ExpenseFlowApi.updateExpenseCategory({ id, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categorySummaryRoot() })
      toast.success(t('expenseCategories.updateSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'expenseCategories.updateError')),
  })
}

export function useDeleteExpenseCategory(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExpenseFlowApi.deleteExpenseCategory(id),
    onSuccess: async () => {
      //
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.categorySummaryRoot() }),
      ])
      toast.success(t('expenseCategories.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'expenseCategories.deleteError'))
    },
  })
}
