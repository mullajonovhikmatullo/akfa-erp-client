import type { TransferFilters } from '@store/store-stub'

export const transferKeys = {
  all: ['transfers'] as const,
  list: (filters?: TransferFilters) => [...transferKeys.all, 'list', filters] as const,
  detail: (id: string) => [...transferKeys.all, 'detail', id] as const,
}
