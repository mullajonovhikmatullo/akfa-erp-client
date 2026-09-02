import type { BatchFilters, InventoryFilters, ReceiptPageQuery } from '@store/store-stub'

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
