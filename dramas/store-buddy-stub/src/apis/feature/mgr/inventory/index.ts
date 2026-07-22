import { http } from '@erp/erp-shared'
import type { ProductUnit } from '@erp/erp-shared'
import type {
  BatchFilters,
  BatchPage,
  BatchPageQuery,
  BatchSummary,
  InventoryFilters,
  InventoryRecord,
  StockBatch,
  StockInPayload,
} from '../../../../models/domain/inventory'

type Raw = Record<string, unknown>

const parseBatch = (raw: Raw): StockBatch => ({
  ...(raw as unknown as StockBatch),
  initialQty: Number(raw.initialQty),
  remainingQty: Number(raw.remainingQty),
  costPriceUzs: Number(raw.costPriceUzs),
  costPriceUsd: raw.costPriceUsd != null ? Number(raw.costPriceUsd) : null,
  product: {
    ...(raw.product as { id: string; name: string; sku: string | null; unit: ProductUnit }),
  },
})

const parseInventoryRecord = (raw: Raw): InventoryRecord => ({
  ...(raw as unknown as InventoryRecord),
  quantity: Number(raw.quantity),
  product: {
    ...(raw.product as InventoryRecord['product']),
  },
})

const stockIn = (payload: StockInPayload) => http.post('/inventory/stock-in', payload, { timeout: 0 }).then((response) => parseBatch(response.data.data))

const stockInBatch = (payload: StockInPayload[]) =>
  http.post('/inventory/stock-in/batch', payload, { timeout: 0 }).then((response) => (response.data.data as Raw[]).map(parseBatch))

const findInventoryRecords = (params?: InventoryFilters) =>
  http.get('/inventory', { params }).then((response) => (response.data.data as Raw[]).map(parseInventoryRecord))

const findStockBatches = (params?: BatchFilters) =>
  http.get('/inventory/batches', { params }).then((response) => (response.data.data as Raw[]).map(parseBatch))

const findStockBatchSummary = (): Promise<BatchSummary> =>
  http.get('/inventory/batches/summary').then((response) => {
    //
    const body = response.data.data as BatchSummary
    return {
      totalBatches: Number(body.totalBatches),
      totalActive: Number(body.totalActive),
      totalCostUzs: Number(body.totalCostUzs),
      totalRemainingValueUzs: Number(body.totalRemainingValueUzs),
    }
  })

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

export const InventorySeekApi = {
  findInventoryRecords,
  findStockBatches,
  findStockBatchSummary,
  findStockBatchesPage,
  fetch: {
    findInventoryRecords: (params?: InventoryFilters) => ({
      queryKey: ['inventory', 'list', params] as const,
      queryFn: () => findInventoryRecords(params),
    }),
    findStockBatches: (params?: BatchFilters) => ({
      queryKey: ['inventory', 'batches', params] as const,
      queryFn: () => findStockBatches(params),
    }),
    findStockBatchSummary: () => ({
      queryKey: ['inventory', 'batches', 'summary'] as const,
      queryFn: findStockBatchSummary,
    }),
    findStockBatchesPage: (params: BatchPageQuery) => ({
      queryKey: ['inventory', 'batches', 'paginated', params.page, params.pageSize, params] as const,
      queryFn: () => findStockBatchesPage(params),
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
