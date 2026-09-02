import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'

export function useStockReceiptItemsPage(receiptId: string | undefined, page: number, pageSize: number) {
  //
  const query = InventorySeekApi.fetch.findReceiptItemsPage(receiptId ?? '', page, pageSize)

  return useQuery({ ...query, enabled: Boolean(receiptId), staleTime: 2 * 60 * 1000 })
}
