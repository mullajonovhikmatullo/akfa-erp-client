import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { InventorySeekApi } from '@store/store-stub'
import type { StockLevelPageQuery } from '@store/store-stub'

export function useStockLevelsPage(query: StockLevelPageQuery) {
  //
  const { queryKey, queryFn } = InventorySeekApi.fetch.findStockLevelsPage(query)

  return useQuery({ queryKey, queryFn, placeholderData: keepPreviousData })
}
