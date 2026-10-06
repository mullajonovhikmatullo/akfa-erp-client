import { useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'

export function useStockReceiptDetail(receiptId: string | null) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findReceipt(receiptId ?? '')

  return useQuery({ queryKey, queryFn, enabled: Boolean(receiptId), retry: false })
}
