import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/shared/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        //
        const axiosError = error as AxiosError<ApiError>;
        // Never retry on 401/403/404 — they won't succeed on retry
        if ([401, 403, 404].includes(axiosError.response?.status ?? 0)) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 2, // 2 min — ERP data is relatively stable
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  //
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
