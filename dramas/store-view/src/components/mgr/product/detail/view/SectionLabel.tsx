import type { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  //
  return (
    <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-10 u-text-uppercase">
      {children}
    </div>
  )
}
