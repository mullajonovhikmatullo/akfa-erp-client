import { useQuery } from '@tanstack/react-query'
import { TransferSeekApi } from '@store/store-stub'
import type { TransferFilters } from '@store/store-stub'

export function useTransfersList(filters?: TransferFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = TransferSeekApi.fetch.findTransfers(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}
