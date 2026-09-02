import { QueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ApiError } from '@store/store-stub'

const NON_RETRYABLE_STATUSES = new Set([401, 403, 404])
const TWO_MINUTES = 1000 * 60 * 2
const TEN_MINUTES = 1000 * 60 * 10

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        //
        const status = (error as AxiosError<ApiError>).response?.status

        if (status && NON_RETRYABLE_STATUSES.has(status)) {
          return false
        }

        return failureCount < 2
      },
      staleTime: TWO_MINUTES,
      gcTime: TEN_MINUTES,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
