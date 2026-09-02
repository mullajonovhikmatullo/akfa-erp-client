import type { ProductListParams } from '@store/store-stub'

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductListParams) => ['products', 'list', filters ?? {}] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  inventory: (productId: string) => ['products', 'inventory', productId] as const,
  summary: () => ['products', 'summary'] as const,
}
