import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SaleFlowApi } from '@store/store-stub'
import type { AddPaymentPayload, CreateSalePayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { customerKeys } from '../../customer'
import { saleKeys } from './saleKeys'

export function useSaleMutation(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  const createSale = useMutation({
    mutationFn: (payload: CreateSalePayload) => SaleFlowApi.createSale(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'sales.createError'))
    },
  })

  const addPayment = useMutation({
    mutationFn: ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) => SaleFlowApi.addPayment({ saleId, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.paymentSuccess'))
    },
    onError: () => toast.error(t('sales.paymentError')),
  })

  const setDebtDeadline = useMutation({
    mutationFn: ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
      SaleFlowApi.setDebtDeadline({ saleId, debtDueDate }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.debtDeadlineSuccess'))
    },
  })

  return { createSale, addPayment, setDebtDeadline }
}
