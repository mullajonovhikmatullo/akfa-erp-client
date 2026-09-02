import type { ReactNode } from 'react'

export function SectionTitle({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {children}
      </h3>
    </div>
  )
}
