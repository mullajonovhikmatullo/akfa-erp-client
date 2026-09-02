import type { ReactNode } from 'react'

export function CustomerKpiBox({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: ReactNode
  hint: string
  tone: 'danger' | 'success' | 'muted'
}) {
  //
  return (
    <div className="card u-p-14-16" >
      <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
        {label}
      </div>
      <div className={`num customer-kpi-value tone-${tone}`}>
        {value}
      </div>
      <div className="u-text-muted u-fs-12 u-mt-4">{hint}</div>
    </div>
  )
}
