import type { ReactNode } from 'react'

export function Label({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {children}
    </div>
  )
}
