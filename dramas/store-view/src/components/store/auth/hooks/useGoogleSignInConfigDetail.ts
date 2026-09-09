import { useQuery } from '@tanstack/react-query'
import { UserSeekApi } from '@store/store-stub'

export function useGoogleSignInConfigDetail() {
  //
  return useQuery({
    ...UserSeekApi.fetch.findGoogleSignInConfig(),
    staleTime: 60_000,
    retry: 1,
  })
}
