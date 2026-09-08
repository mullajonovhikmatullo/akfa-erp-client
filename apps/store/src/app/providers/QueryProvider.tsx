import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { queryClient } from './query/queryClient'
import { useAuthStore } from '@/entities/user/model/auth.store'

export function QueryProvider({ children }: { children: ReactNode }) {
  //
  const sessionVersion = useAuthStore((state) => state.sessionVersion)
  return (
    <QueryClientProvider key={sessionVersion} client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
