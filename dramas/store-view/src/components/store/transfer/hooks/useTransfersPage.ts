import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { TransferSeekApi } from '@store/store-stub'
import type { TransferPageQuery } from '@store/store-stub'

export function useTransfersPage(query: TransferPageQuery) {
  //
  const { queryKey, queryFn } = TransferSeekApi.fetch.findTransfersPage(query)

  return useQuery({ queryKey, queryFn, placeholderData: keepPreviousData })
}
