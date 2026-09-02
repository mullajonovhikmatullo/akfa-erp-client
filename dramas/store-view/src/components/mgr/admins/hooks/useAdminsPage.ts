import { useQuery } from '@tanstack/react-query'
import { UserSeekApi } from '@store/store-stub'

export function useAdminsPage(page: number, pageSize: number) {
  //
  const { queryKey, queryFn } = UserSeekApi.fetch.findAdminsPage({ page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}
