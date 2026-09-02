import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useExpenseCategoriesList } from '../hooks/useExpenseCategoriesList'
import { useExpenseMutation } from '../hooks/useExpenseMutation'
import { createExpenseSchema, type ExpenseFormValues } from './expenseSchema'

interface UseExpenseFormOptions {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  exchangeRate: number
  branchId?: string
}

function getDefaultValues(exchangeRate: number): ExpenseFormValues {
  //
  return {
    categoryId: '',
    currency: 'UZS',
    amount: 0,
    usdToUzsRate: exchangeRate,
    description: '',
    expenseDate: dayjs().toISOString(),
  }
}

export function useExpenseForm({ t, open, onClose, exchangeRate, branchId }: UseExpenseFormOptions) {
  //
  const schema = useMemo(() => createExpenseSchema(t), [t])
  const { data: categories = [], isLoading: categoriesLoading } = useExpenseCategoriesList()
  const { createExpense } = useExpenseMutation(t)
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(exchangeRate),
  })
  const currency = form.watch('currency')

  useEffect(() => {
    if (open) form.reset(getDefaultValues(exchangeRate))
  }, [exchangeRate, form, open])

  const onSubmit = form.handleSubmit((values) => {
    //
    const amount = values.currency === 'USD' ? Number((values.amount * exchangeRate).toFixed(2)) : values.amount
    createExpense.mutate(
      {
        branchId,
        categoryId: values.categoryId,
        amount,
        currency: values.currency,
        amountUsd: values.currency === 'USD' ? values.amount : 0,
        usdToUzsRate: values.currency === 'USD' ? exchangeRate : undefined,
        description: values.description || undefined,
        expenseDate: values.expenseDate || undefined,
      },
      {
        onSuccess: () => {
          //
          form.reset(getDefaultValues(exchangeRate))
          onClose()
        },
      },
    )
  })

  return {
    form,
    currency,
    categories,
    categoriesLoading,
    onSubmit,
    isPending: createExpense.isPending,
  }
}
