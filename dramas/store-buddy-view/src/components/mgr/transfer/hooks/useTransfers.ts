import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TransferFlowApi, TransferSeekApi } from '@erp/store-buddy-stub'
import type { CreateTransferPayload, TransferFilters } from '@erp/store-buddy-stub'
import { inventoryKeys } from '../../inventory/hooks/useInventory'

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

export function useCreateTransfer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => TransferFlowApi.createTransfer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Transfer yaratildi')
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Transferda xatolik')
    },
  })
}

export function useCompleteTransfer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransferFlowApi.completeTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Transfer yakunlandi, ombor yangilandi')
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Yakunlashda xatolik')
    },
  })
}

export function useCancelTransfer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransferFlowApi.cancelTransfer(id),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Transfer bekor qilindi')
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Bekor qilishda xatolik')
    },
  })
}
