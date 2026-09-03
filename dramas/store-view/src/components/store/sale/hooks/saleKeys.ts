import type { SaleFilters } from '@store/store-stub'

export const saleKeys = {
  all: ['sales'] as const,
  list: (filters?: SaleFilters) => [...saleKeys.all, 'list', filters] as const,
  paginated: (page: number, pageSize: number, filters?: SaleFilters) => [...saleKeys.all, 'paginated', page, pageSize, filters] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
}
