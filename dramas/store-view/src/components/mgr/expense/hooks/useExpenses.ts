import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExpenseFlowApi, ExpenseSeekApi } from '@store/store-stub'
import type {
  CreateExpenseCategoryPayload,
  CreateExpensePayload,
  ExpenseFilters,
  UpdateExpenseCategoryPayload,
} from '@store/store-stub'

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

export function useCreateExpense() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => ExpenseFlowApi.createExpense(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Xarajat qayd qilindi')
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? "Xarajat qo'shishda xatolik")
    },
  })
}

export function useDeleteExpense() {
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
      toast.success("Xarajat o'chirildi")
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? "O'chirishda xatolik")
    },
  })
}

export function useCreateExpenseCategory() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) => ExpenseFlowApi.createExpenseCategory(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      toast.success("Kategoriya qo'shildi")
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Xatolik')
    },
  })
}

export function useUpdateExpenseCategory() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpenseCategoryPayload }) =>
      ExpenseFlowApi.updateExpenseCategory({ id, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categorySummaryRoot() })
      toast.success('Kategoriya yangilandi')
    },
  })
}

export function useDeleteExpenseCategory() {
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
      toast.success("Kategoriya o'chirildi")
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? "O'chirishda xatolik")
    },
  })
}
