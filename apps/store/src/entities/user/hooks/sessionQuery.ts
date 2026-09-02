import { UserFlowApi } from '@store/store-stub'

export const sessionKeys = {
  all: ['auth', 'me'] as const,
  detail: (userId?: string) => [...sessionKeys.all, userId] as const,
}

export function sessionDetailQueryOptions(userId?: string) {
  //
  return {
    queryKey: sessionKeys.detail(userId),
    queryFn: UserFlowApi.me,
  }
}
