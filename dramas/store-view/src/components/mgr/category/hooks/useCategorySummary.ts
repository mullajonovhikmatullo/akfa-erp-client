import { useQuery } from '@tanstack/react-query'
import { CategorySeekApi } from '@store/store-stub'

export function useCategorySummary() {
  //
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategorySummary()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}
