import type { StoreTranslator } from '@store/store-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SaleFlowApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { analyticsKeys } from '../../analytics/hooks/analyticsKeys'
import { customerKeys } from '../../customer/hooks/customerKeys'
import { inventoryKeys } from '../../inventory/hooks/inventoryKeys'
import { saleKeys } from './saleKeys'

export function useSaleMutation(t: StoreTranslator) {
  //
  const queryClient = useQueryClient()

  const createSale = useMutation({
    mutationFn: SaleFlowApi.createSale,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('sales.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'sales.createError'))
    },
  })

  const addPayment = useMutation({
    mutationFn: SaleFlowApi.addPayment,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('sales.paymentSuccess'))
    },
    onError: () => toast.error(t('sales.paymentError')),
  })

  const setDebtDeadline = useMutation({
    mutationFn: SaleFlowApi.setDebtDeadline,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('sales.debtDeadlineSuccess'))
    },
  })

  return { createSale, addPayment, setDebtDeadline }
}
