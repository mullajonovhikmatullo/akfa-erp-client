import { apiClient } from '@/shared/api/client';
import type { StockBatch, ProductUnit } from '@/shared/types/domain';

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

export interface StockInPayload {
  branchId?: string;
  productId: string;
  quantity: number;
  costPriceUzs: number;
  costPriceUsd?: number;
  supplierNote?: string;
}

export interface BatchFilters {
  branchId?: string;
  productId?: string;
  depleted?: boolean;
}

export const inventoryApi = {
  stockIn: (payload: StockInPayload) =>
    apiClient.post('/inventory/stock-in', payload).then((r) => parseBatch(r.data.data)),

  listBatches: (params?: BatchFilters) =>
    apiClient.get('/inventory/batches', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseBatch),
    ),
};
