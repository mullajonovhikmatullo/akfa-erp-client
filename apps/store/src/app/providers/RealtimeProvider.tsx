import type { ReactNode } from 'react'
import { useRealtimeConnection } from './hooks/useRealtimeConnection'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  //
  useRealtimeConnection()
  return children
}
