import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TransferFlowApi } from '@store/store-stub'
import type { CreateTransferPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { inventoryKeys } from '../../inventory'
import { transferKeys } from './transferKeys'

type Translate = (key: string) => string

export function useTransferMutation(t: Translate) {
  //
  const queryClient = useQueryClient()

  const createTransfer = useMutation({
    mutationFn: (payload: CreateTransferPayload) => TransferFlowApi.createTransfer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.createError')),
  })

  const completeTransfer = useMutation({
    mutationFn: (id: string) => TransferFlowApi.completeTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.completeSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.completeError')),
  })

  const cancelTransfer = useMutation({
    mutationFn: (id: string) => TransferFlowApi.cancelTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.cancelSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.cancelError')),
  })

  return { createTransfer, completeTransfer, cancelTransfer }
}
