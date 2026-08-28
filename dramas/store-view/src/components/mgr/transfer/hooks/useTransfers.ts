import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TransferFlowApi, TransferSeekApi } from '@store/store-stub'
import type { CreateTransferPayload, TransferFilters } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'
import { inventoryKeys } from '../../inventory/hooks/useInventory'

type Translate = (key: string) => string

export const transferKeys = {
  all: ['transfers'] as const,
  list: (filters?: TransferFilters) => [...transferKeys.all, 'list', filters] as const,
  detail: (id: string) => [...transferKeys.all, 'detail', id] as const,
}

export function useTransfers(filters?: TransferFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = TransferSeekApi.fetch.findTransfers(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}

export function useCreateTransfer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => TransferFlowApi.createTransfer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.createError'))
    },
  })
}

export function useCompleteTransfer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransferFlowApi.completeTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.completeSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.completeError'))
    },
  })
}

export function useCancelTransfer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransferFlowApi.cancelTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('transfers.cancelSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'transfers.cancelError'))
    },
  })
}
