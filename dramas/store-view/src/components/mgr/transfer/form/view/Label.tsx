import type { ReactNode } from 'react'

export function Label({ children }: { children: ReactNode }) {
  //
  return (
    <div className="u-text-muted u-fs-12 u-tracking-normal u-mb-6 u-text-uppercase">
      {children}
    </div>
  )
}
