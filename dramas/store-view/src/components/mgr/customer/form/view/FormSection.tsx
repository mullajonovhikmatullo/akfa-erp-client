import type { ReactNode } from 'react'

export function FormSection({ children }: { children: ReactNode }) {
  //
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
}
