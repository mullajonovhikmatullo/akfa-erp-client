import type { ReactNode } from 'react'

export function StatBox({ label, value, tone = 'muted' }: { label: string; value: ReactNode; tone?: 'success' | 'danger' | 'muted' }) {
  //
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : 'var(--ink-1)'

  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontWeight: 700, fontSize: 14, color }}>
        {value}
      </div>
    </div>
  )
}
