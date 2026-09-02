import type { ReactNode } from 'react'

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  //
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
