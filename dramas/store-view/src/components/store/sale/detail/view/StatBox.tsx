import type { ReactNode } from 'react'

export function StatBox({ label, value, tone = 'muted' }: { label: string; value: ReactNode; tone?: 'success' | 'danger' | 'muted' }) {
  //
  return (
    <div className="u-bg-surface-2 u-rounded-8 u-border-default u-p-10-12">
      <div className="u-text-muted u-fs-11 u-mb-4">{label}</div>
      <div className={`num sale-stat-value tone-${tone}`}>
        {value}
      </div>
    </div>
  )
}
