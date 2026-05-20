import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { Product, InventoryRecord, ProductUnit } from '@/shared/types/domain';

// Prisma Decimal serializes to string — parse to number at the API boundary
const parseProduct = (raw: Record<string, unknown>): Product => ({
  ...(raw as unknown as Product),
  retailPriceUzs: Number(raw.retailPriceUzs),
  wholesalePriceUzs: Number(raw.wholesalePriceUzs),
  retailPriceUsd: raw.retailPriceUsd != null ? Number(raw.retailPriceUsd) : null,
  wholesalePriceUsd: raw.wholesalePriceUsd != null ? Number(raw.wholesalePriceUsd) : null,
  categoryId: raw.category ? (raw.category as { id: string }).id : null,
});

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  unit?: ProductUnit;
  isActive?: boolean;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  sku?: string;
  unit: ProductUnit;
  categoryId?: string;
  retailPriceUzs: number;
  wholesalePriceUzs: number;
  retailPriceUsd?: number;
  wholesalePriceUsd?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & { isActive?: boolean };

export interface ProductPage {
  items: Product[];
  total: number;
}

export const productApi = {
  list: (params?: ProductListParams) =>
    apiClient
      .get<ApiResponse<Record<string, unknown>[]>>('/products', { params })
      .then((r) => r.data.data.map(parseProduct)),

  listPaginated: (params: ProductListParams & { page: number; pageSize: number }) =>
    apiClient
      .get<ApiResponse<{ items: Record<string, unknown>[]; total: number }>>('/products', { params })
      .then((r) => ({
        items: r.data.data.items.map(parseProduct),
        total: r.data.data.total,
      })),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Record<string, unknown>>>(`/products/${id}`)
      .then((r) => parseProduct(r.data.data)),

  create: (payload: CreateProductPayload) =>
    apiClient
      .post<ApiResponse<Record<string, unknown>>>('/products', payload)
      .then((r) => parseProduct(r.data.data)),

  update: (id: string, payload: UpdateProductPayload) =>
    apiClient
      .patch<ApiResponse<Record<string, unknown>>>(`/products/${id}`, payload)
      .then((r) => parseProduct(r.data.data)),

  remove: (id: string) =>
    apiClient.delete(`/products/${id}`),

  getInventory: (productId: string) =>
    apiClient
      .get<ApiResponse<Array<Record<string, unknown>>>>('/inventory', { params: { productId } })
      .then((r) =>
        r.data.data.map((row) => ({
          ...(row as unknown as InventoryRecord),
          quantity: Number(row.quantity),
        })) as InventoryRecord[],
      ),
};
