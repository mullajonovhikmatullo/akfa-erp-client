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
  const colors: Record<string, string> = {
    danger: 'var(--danger)',
    success: 'var(--success)',
    muted: 'var(--ink-2)',
  }
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700, color: colors[tone] }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
    </div>
  )
}
