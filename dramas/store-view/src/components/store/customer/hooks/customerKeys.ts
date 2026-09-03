import type { CustomerFilters } from '@store/store-stub'

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
}
