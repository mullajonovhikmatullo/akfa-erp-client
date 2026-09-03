import type { StoreTranslator } from '@store/store-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TransferFlowApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { analyticsKeys } from '../../analytics/hooks/analyticsKeys'
import { inventoryKeys } from '../../inventory/hooks/inventoryKeys'
import { transferKeys } from './transferKeys'

type Translate = StoreTranslator

export function useTransferMutation(t: Translate) {
  //
  const queryClient = useQueryClient()

  const createTransfer = useMutation({
    mutationFn: TransferFlowApi.createTransfer,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('transfers.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.createError')),
  })

  const completeTransfer = useMutation({
    mutationFn: TransferFlowApi.completeTransfer,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('transfers.completeSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.completeError')),
  })

  const cancelTransfer = useMutation({
    mutationFn: TransferFlowApi.cancelTransfer,
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      toast.success(t('transfers.cancelSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.cancelError')),
  })

  return { createTransfer, completeTransfer, cancelTransfer }
}
