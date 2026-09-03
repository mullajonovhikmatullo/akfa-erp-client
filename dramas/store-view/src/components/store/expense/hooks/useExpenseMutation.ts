import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExpenseFlowApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { analyticsKeys } from '../../analytics/hooks/analyticsKeys'
import { expenseKeys } from './expenseKeys'

type Translate = (key: string) => string

export function useExpenseMutation(t: Translate) {
  //
  const queryClient = useQueryClient()

  const createExpense = useMutation({
    mutationFn: ExpenseFlowApi.createExpense,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('expenses.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'expenses.createError')),
  })

  const deleteExpense = useMutation({
    mutationFn: ExpenseFlowApi.deleteExpense,
    onSuccess: async () => {
      //
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
      ])
      toast.success(t('expenses.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'expenses.deleteError'))
    },
  })

  const createExpenseCategory = useMutation({
    mutationFn: ExpenseFlowApi.createExpenseCategory,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      toast.success(t('expenseCategories.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'expenseCategories.createError')),
  })

  const updateExpenseCategory = useMutation({
    mutationFn: ExpenseFlowApi.updateExpenseCategory,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: expenseKeys.categoriesRoot() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.categorySummaryRoot() })
      toast.success(t('expenseCategories.updateSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'expenseCategories.updateError')),
  })

  const deleteExpenseCategory = useMutation({
    mutationFn: ExpenseFlowApi.deleteExpenseCategory,
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

  return { createExpense, deleteExpense, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory }
}
