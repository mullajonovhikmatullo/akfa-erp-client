import type { ReactNode } from 'react'

export function SectionTitle({ children }: { children: ReactNode }) {
  //
  return (
    <div className="u-items-center u-flex u-justify-between u-m-8-0-12">
      <h3 className="u-text-secondary u-fs-14 u-fw-600 u-tracking-wide u-m-0 u-text-uppercase">
        {children}
      </h3>
    </div>
  )
}
