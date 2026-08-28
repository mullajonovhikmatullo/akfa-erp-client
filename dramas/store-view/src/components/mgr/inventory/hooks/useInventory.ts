import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { InventoryFlowApi, InventorySeekApi } from '@store/store-stub'
import type { BatchFilters, InventoryFilters, ReceiptPageQuery, StockInPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filters?: InventoryFilters) => [...inventoryKeys.all, 'list', filters] as const,
  batches: (filters?: BatchFilters) => [...inventoryKeys.all, 'batches', filters] as const,
  batchSummary: (filters?: Pick<BatchFilters, 'branchId'>) => [...inventoryKeys.all, 'batches', 'summary', filters] as const,
  batchesPaginated: (page: number, pageSize: number, filters?: BatchFilters) =>
    [...inventoryKeys.all, 'batches', 'paginated', page, pageSize, filters] as const,
  receiptsPaginated: (query: ReceiptPageQuery) => [...inventoryKeys.all, 'receipts', 'paginated', query] as const,
  receiptItems: (receiptId: string, page: number, pageSize: number) =>
    [...inventoryKeys.all, 'receipts', receiptId, 'items', page, pageSize] as const,
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

export function useStockBatchSummary(filters?: Pick<BatchFilters, 'branchId'>) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockBatchSummary(filters)

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 0,
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

export function useStockReceiptsPage(query: ReceiptPageQuery) {
  const { queryKey, queryFn } = InventorySeekApi.fetch.findReceiptsPage(query)
  return useQuery({ queryKey, queryFn, staleTime: 0 })
}

export function useStockReceiptItems(receiptId: string | undefined, page: number, pageSize: number) {
  const query = InventorySeekApi.fetch.findReceiptItemsPage(receiptId ?? '', page, pageSize)
  return useQuery({ ...query, enabled: Boolean(receiptId), staleTime: 2 * 60 * 1000 })
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
      const isTimeout = typedError.code === 'ECONNABORTED' || typedError.message?.includes('timeout')
      toast.error(isTimeout ? t('stockIn.timeoutError') : getLocalizedApiErrorMessage(error, t, 'stockIn.error'))
    },
  })
}
