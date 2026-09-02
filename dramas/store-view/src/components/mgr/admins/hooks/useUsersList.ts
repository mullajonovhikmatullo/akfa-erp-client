import { useQuery } from '@tanstack/react-query'
import { UserSeekApi } from '@store/store-stub'
import { userKeys } from './userKeys'

export function useUsersList() {
  //
  const { queryKey, queryFn } = UserSeekApi.fetch.findUsers()

  return useQuery({
    queryKey: queryKey ?? userKeys.list(),
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}
