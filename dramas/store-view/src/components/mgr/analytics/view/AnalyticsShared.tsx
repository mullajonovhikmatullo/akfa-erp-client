import type { ReactNode } from 'react'
import type { TFunc } from './types'

const TONE_COLORS: Record<string, string> = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning, #f59e0b)',
  muted: 'var(--ink-2)',
}

export function KpiCard({ label, value, sub, tone = 'muted' }: { label: string; value: ReactNode; sub: string; tone?: string }) {
  //
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700, color: TONE_COLORS[tone] }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

export function ProgressBar({ pct }: { pct: number }) {
  //
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  //
  return <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{children}</div>
}

export function Empty({ t }: { t: TFunc }) {
  //
  return <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>{t('common.noData')}</div>
}
