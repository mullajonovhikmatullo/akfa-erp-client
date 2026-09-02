import { useQuery } from '@tanstack/react-query'
import { sessionDetailQueryOptions } from './sessionQuery'

export function useSessionDetail(userId: string | undefined, enabled: boolean) {
  //
  return useQuery({
    ...sessionDetailQueryOptions(userId),
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}
