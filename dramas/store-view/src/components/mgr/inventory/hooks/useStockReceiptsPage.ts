import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { ReceiptPageQuery } from '@store/store-stub'

export function useStockReceiptsPage(query: ReceiptPageQuery) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findReceiptsPage(query)

  return useQuery({ queryKey, queryFn, staleTime: 0 })
}
