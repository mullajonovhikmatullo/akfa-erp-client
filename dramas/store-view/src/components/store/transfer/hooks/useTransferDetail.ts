import { useQuery } from '@tanstack/react-query'
import { TransferSeekApi } from '@store/store-stub'

export function useTransferDetail(id: string | null) {
  //
  const { queryKey, queryFn } = TransferSeekApi.fetch.findTransfer(id ?? '')

  return useQuery({ queryKey, queryFn, enabled: Boolean(id) })
}
