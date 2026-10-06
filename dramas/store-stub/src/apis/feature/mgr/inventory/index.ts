import { http } from '@store/store-shared'
import type { ProductUnit } from '@store/store-shared'
import type {
  BatchFilters,
  BatchPage,
  BatchPageQuery,
  BatchSummary,
  InventoryFilters,
  InventoryRecord,
  ReceiptItemsPage,
  ReceiptPage,
  ReceiptPageQuery,
  StockBatch,
  StockInPayload,
  StockLevelPage,
  StockReceipt,
  StockLevelPageQuery,
} from '../../../../models/domain/inventory'

type Raw = Record<string, unknown>

const parseBatch = (raw: Raw): StockBatch => ({
  ...(raw as unknown as StockBatch),
  initialQty: Number(raw.initialQty),
  remainingQty: Number(raw.remainingQty),
  costPriceUzs: Number(raw.costPriceUzs),
  costPriceUsd: raw.costPriceUsd != null ? Number(raw.costPriceUsd) : null,
  wholesalePriceUzs: raw.wholesalePriceUzs != null ? Number(raw.wholesalePriceUzs) : null,
  retailPriceUzs: raw.retailPriceUzs != null ? Number(raw.retailPriceUzs) : null,
  wholesalePriceUsd: raw.wholesalePriceUsd != null ? Number(raw.wholesalePriceUsd) : null,
  retailPriceUsd: raw.retailPriceUsd != null ? Number(raw.retailPriceUsd) : null,
  product: {
    ...(raw.product as { id: string; name: string; sku: string | null; unit: ProductUnit }),
  },
})

const parseInventoryRecord = (raw: Raw): InventoryRecord => ({
  ...(raw as unknown as InventoryRecord),
  quantity: Number(raw.quantity),
  product: {
    ...(raw.product as InventoryRecord['product']),
    lowStockThreshold: (raw.product as Record<string, unknown>).lowStockThreshold != null
      ? Number((raw.product as Record<string, unknown>).lowStockThreshold)
      : null,
  },
})

const stockIn = (payload: StockInPayload) => http.post('/inventory/stock-in', payload, { timeout: 0 }).then((response) => parseBatch(response.data.data))

const stockInBatch = (payload: StockInPayload[]) =>
  http.post('/inventory/stock-in/batch', payload, { timeout: 0 }).then((response) => (response.data.data as Raw[]).map(parseBatch))

const findInventoryRecords = (params?: InventoryFilters) =>
  http.get('/inventory', { params }).then((response) => (response.data.data as Raw[]).map(parseInventoryRecord))

const findStockBatches = (params?: BatchFilters) =>
  http.get('/inventory/batches', { params }).then((response) => (response.data.data as Raw[]).map(parseBatch))

const findStockBatchSummary = (params?: Pick<BatchFilters, 'branchId'>): Promise<BatchSummary> =>
  http.get('/inventory/batches/summary', { params }).then((response) => {
    //
    const body = response.data.data as BatchSummary
    return {
      totalBatches: Number(body.totalBatches),
      totalActive: Number(body.totalActive),
      totalCostUzs: Number(body.totalCostUzs),
      totalRemainingValueUzs: Number(body.totalRemainingValueUzs),
    }
  })

const findStockLevelsPage = (params: StockLevelPageQuery) =>
  http.get('/inventory/stock', { params }).then((response) => response.data.data as StockLevelPage)

const findStockBatchesPage = (params: BatchPageQuery): Promise<BatchPage> =>
  http.get('/inventory/batches', { params }).then((response) => {
    //
    const body = response.data.data as {
      items: Raw[]
      total: number
      totalBatches: number
      totalActive: number
      totalCostUzs: number
      totalRemainingValueUzs: number
    }
    return {
      items: body.items.map(parseBatch),
      total: body.total,
      totalBatches: body.totalBatches,
      totalActive: body.totalActive,
      totalCostUzs: body.totalCostUzs,
      totalRemainingValueUzs: body.totalRemainingValueUzs ?? 0,
    }
  })

const parseReceipt = (item: Raw): StockReceipt => ({
  ...(item as unknown as StockReceipt),
  productCount: Number(item.productCount),
  pieceQuantity: Number(item.pieceQuantity),
  kgQuantity: Number(item.kgQuantity),
  totalCostUzs: Number(item.totalCostUzs),
  remainingValueUzs: Number(item.remainingValueUzs),
})

const findReceiptsPage = (params: ReceiptPageQuery): Promise<ReceiptPage> =>
  http.get('/inventory/receipts', { params }).then((response) => {
    const body = response.data.data as { items: Raw[]; total: number }
    return { total: Number(body.total), items: body.items.map(parseReceipt) }
  })

const findReceipt = (receiptId: string) =>
  http.get(`/inventory/receipts/${receiptId}`).then((response) => parseReceipt(response.data.data))

const findReceiptItemsPage = (receiptId: string, page: number, pageSize: number): Promise<ReceiptItemsPage> =>
  http.get(`/inventory/receipts/${receiptId}/items`, { params: { page, pageSize } }).then((response) => {
    const body = response.data.data as { items: Raw[]; total: number }
    return { items: body.items.map(parseBatch), total: Number(body.total) }
  })

export const InventorySeekApi = {
  findInventoryRecords,
  findStockBatches,
  findStockBatchSummary,
  findStockBatchesPage,
  findStockLevelsPage,
  findReceiptsPage,
  findReceipt,
  findReceiptItemsPage,
  fetch: {
    findInventoryRecords: (params?: InventoryFilters) => ({
      queryKey: ['inventory', 'list', params] as const,
      queryFn: () => findInventoryRecords(params),
    }),
    findStockBatches: (params?: BatchFilters) => ({
      queryKey: ['inventory', 'batches', params] as const,
      queryFn: () => findStockBatches(params),
    }),
    findStockBatchSummary: (params?: Pick<BatchFilters, 'branchId'>) => ({
      queryKey: ['inventory', 'batches', 'summary', params] as const,
      queryFn: () => findStockBatchSummary(params),
    }),
    findStockBatchesPage: (params: BatchPageQuery) => ({
      queryKey: ['inventory', 'batches', 'paginated', params.page, params.pageSize, params] as const,
      queryFn: () => findStockBatchesPage(params),
    }),
    findStockLevelsPage: (params: StockLevelPageQuery) => ({
      queryKey: ['inventory', 'stock', 'paginated', params] as const,
      queryFn: () => findStockLevelsPage(params),
    }),
    findReceiptsPage: (params: ReceiptPageQuery) => ({
      queryKey: ['inventory', 'receipts', 'paginated', params] as const,
      queryFn: () => findReceiptsPage(params),
    }),
    findReceipt: (receiptId: string) => ({
      queryKey: ['inventory', 'receipts', receiptId, 'detail'] as const,
      queryFn: () => findReceipt(receiptId),
    }),
    findReceiptItemsPage: (receiptId: string, page: number, pageSize: number) => ({
      queryKey: ['inventory', 'receipts', receiptId, 'items', page, pageSize] as const,
      queryFn: () => findReceiptItemsPage(receiptId, page, pageSize),
    }),
  },
}

export const InventoryFlowApi = {
  stockIn,
  stockInBatch,
}

export const inventoryApi = {
  stockIn,
  stockInBatch,
  listCurrent: findInventoryRecords,
  listBatches: findStockBatches,
  batchSummary: findStockBatchSummary,
  listBatchesPaginated: findStockBatchesPage,
}
