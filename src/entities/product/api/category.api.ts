import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { Category } from '@/shared/types/domain';

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload> & { isActive?: boolean };

export interface CategoryPage {
  items: Category[];
  total: number;
}

export interface CategorySummary {
  totalActive: number;
  totalInactive: number;
}

export const categoryApi = {
  list: (isActive?: boolean) =>
    apiClient
      .get<ApiResponse<Category[]>>('/products/categories', {
        params: isActive !== undefined ? { isActive } : undefined,
      })
      .then((r) => r.data.data),

  listPaginated: (params: { page: number; pageSize: number; isActive?: boolean }) =>
    apiClient
      .get<ApiResponse<CategoryPage>>('/products/categories', {
        params,
      })
      .then((r) => r.data.data),

  summary: () =>
    apiClient
      .get<ApiResponse<CategorySummary>>('/products/categories/summary')
      .then((r) => ({
        totalActive: Number(r.data.data.totalActive),
        totalInactive: Number(r.data.data.totalInactive),
      })),

  create: (payload: CreateCategoryPayload) =>
    apiClient
      .post<ApiResponse<Category>>('/products/categories', payload)
      .then((r) => r.data.data),

  update: (id: string, payload: UpdateCategoryPayload) =>
    apiClient
      .patch<ApiResponse<Category>>(`/products/categories/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete(`/products/categories/${id}`),
};
