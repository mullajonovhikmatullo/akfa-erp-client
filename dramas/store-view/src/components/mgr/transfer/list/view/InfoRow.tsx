import type { ReactNode } from 'react'

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  //
  return (
    <div className="u-flex u-gap-12 u-justify-between">
      <span className="u-text-muted">{label}</span>
      <span className="u-fw-600 u-text-right">{value}</span>
    </div>
  )
}
