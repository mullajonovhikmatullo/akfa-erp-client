import { apiClient } from '@/shared/api/client';
import type { InventoryRecord, StockBatch, ProductUnit } from '@/shared/types/domain';

type Raw = Record<string, unknown>;

const parseBatch = (raw: Raw): StockBatch => ({
  ...(raw as unknown as StockBatch),
  initialQty: Number(raw.initialQty),
  remainingQty: Number(raw.remainingQty),
  costPriceUzs: Number(raw.costPriceUzs),
  costPriceUsd: raw.costPriceUsd != null ? Number(raw.costPriceUsd) : null,
  product: {
    ...(raw.product as { id: string; name: string; sku: string | null; unit: ProductUnit }),
  },
});

const parseInventoryRecord = (raw: Raw): InventoryRecord => ({
  ...(raw as unknown as InventoryRecord),
  quantity: Number(raw.quantity),
  product: {
    ...(raw.product as InventoryRecord['product']),
  },
});

export interface StockInPayload {
  branchId?: string;
  productId: string;
  quantity: number;
  costPriceUzs: number;
  costPriceUsd?: number;
}

export interface BatchFilters {
  branchId?: string;
  productId?: string;
  depleted?: boolean;
  from?: string;
  to?: string;
}

export interface InventoryFilters {
  branchId?: string;
  productId?: string;
  categoryId?: string;
  lowStock?: boolean;
}

export interface BatchPage {
  items: StockBatch[];
  total: number;
  totalBatches: number;
  totalActive: number;
  totalCostUzs: number;
  totalRemainingValueUzs: number;
}

export interface BatchSummary {
  totalBatches: number;
  totalActive: number;
  totalCostUzs: number;
  totalRemainingValueUzs: number;
}

export const inventoryApi = {
  stockIn: (payload: StockInPayload) =>
    apiClient
      .post('/inventory/stock-in', payload, { timeout: 0 })
      .then((r) => parseBatch(r.data.data)),

  stockInBatch: (payload: StockInPayload[]) =>
    apiClient
      .post('/inventory/stock-in/batch', payload, { timeout: 0 })
      .then((r) =>
        (r.data.data as Raw[]).map(parseBatch),
      ),

  listCurrent: (params?: InventoryFilters) =>
    apiClient.get('/inventory', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseInventoryRecord),
    ),

  listBatches: (params?: BatchFilters) =>
    apiClient.get('/inventory/batches', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseBatch),
    ),

  batchSummary: (): Promise<BatchSummary> =>
    apiClient.get('/inventory/batches/summary').then((r) => {
      const body = r.data.data as BatchSummary;
      return {
        totalBatches: Number(body.totalBatches),
        totalActive: Number(body.totalActive),
        totalCostUzs: Number(body.totalCostUzs),
        totalRemainingValueUzs: Number(body.totalRemainingValueUzs),
      };
    }),

  listBatchesPaginated: (
    params: BatchFilters & { page: number; pageSize: number }
  ): Promise<BatchPage> =>
    apiClient.get('/inventory/batches', { params }).then((r) => {
      const body = r.data.data as {
        items: Raw[];
        total: number;
        totalBatches: number;
        totalActive: number;
        totalCostUzs: number;
        totalRemainingValueUzs: number;
      };
      return {
        items: body.items.map(parseBatch),
        total: body.total,
        totalBatches: body.totalBatches,
        totalActive: body.totalActive,
        totalCostUzs: body.totalCostUzs,
        totalRemainingValueUzs: body.totalRemainingValueUzs ?? 0,
      };
    }),
};
