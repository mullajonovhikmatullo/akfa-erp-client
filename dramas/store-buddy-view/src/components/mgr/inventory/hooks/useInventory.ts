import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { InventoryFlowApi, InventorySeekApi } from '@erp/store-buddy-stub'
import type { BatchFilters, InventoryFilters, StockInPayload } from '@erp/store-buddy-stub'

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filters?: InventoryFilters) => [...inventoryKeys.all, 'list', filters] as const,
  batches: (filters?: BatchFilters) => [...inventoryKeys.all, 'batches', filters] as const,
  batchSummary: () => [...inventoryKeys.all, 'batches', 'summary'] as const,
  batchesPaginated: (page: number, pageSize: number, filters?: BatchFilters) =>
    [...inventoryKeys.all, 'batches', 'paginated', page, pageSize, filters] as const,
}

export function useInventoryRecords(filters?: InventoryFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findInventoryRecords(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}

export function useStockBatches(filters?: BatchFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatches(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}

export function useStockBatchSummary() {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchSummary()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStockBatchesPage(page: number, pageSize: number, filters?: BatchFilters) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchesPage({ ...filters, page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStockInBatch(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (items: StockInPayload[]) => InventoryFlowApi.stockInBatch(items),
    onSuccess: (_, variables) => {
      //
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`${variables.length} ${t('stockIn.successSuffix')}`)
    },
    onError: (error: unknown) => {
      //
      const typedError = error as {
        code?: string
        message?: string
        response?: { data?: { message?: string } }
      }
      const message = typedError.response?.data?.message
      const isTimeout = typedError.code === 'ECONNABORTED' || typedError.message?.includes('timeout')
      toast.error(isTimeout ? t('stockIn.timeoutError') : (message ?? t('stockIn.error')))
    },
  })
}
