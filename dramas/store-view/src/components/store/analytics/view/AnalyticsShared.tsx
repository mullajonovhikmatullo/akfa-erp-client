import type { ReactNode } from 'react'
import type { TFunc } from './types'

export function KpiCard({ label, value, sub, tone = 'muted' }: { label: string; value: ReactNode; sub: string; tone?: string }) {
  //
  return (
    <div className="card u-p-14-16" >
      <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">{label}</div>
      <div className={`num analytics-kpi-value tone-${tone}`}>{value}</div>
      <div className="u-text-muted u-fs-12 u-mt-4">{sub}</div>
    </div>
  )
}

export function ProgressBar({ pct }: { pct: number }) {
  //
  return (
    <div className="u-bg-border u-rounded-3 u-h-5 u-overflow-hidden">
      <div className={`progress-fill u-w-pct-${Math.round(Math.min(pct, 100))}`} />
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  //
  return <div className="u-fs-13 u-fw-700 u-mb-14">{children}</div>
}

export function Empty({ t }: { t: TFunc }) {
  //
  return <div className="u-text-muted u-fs-13 u-p-8-0">{t('common.noData')}</div>
}
