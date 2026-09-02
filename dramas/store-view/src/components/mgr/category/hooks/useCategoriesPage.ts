import { useQuery } from '@tanstack/react-query'
import { CategorySeekApi } from '@store/store-stub'

export function useCategoriesPage(page: number, pageSize: number, isActive?: boolean) {
  //
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategoriesPage({ page, pageSize, isActive })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}
