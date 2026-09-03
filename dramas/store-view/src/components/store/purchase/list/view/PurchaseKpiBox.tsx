import type { ReactNode } from 'react'

export function PurchaseKpiBox({ label, value, hint, tone = 'muted' }: { label: string; value: ReactNode; hint: string; tone?: 'success' | 'muted' }) {
  //
  return (
    <div className="card purchase-kpi">
      <div className="purchase-kpi__label">{label}</div>
      <div className={`num purchase-kpi__value tone-${tone}`}>{value}</div>
      <div className="purchase-kpi__hint">{hint}</div>
    </div>
  )
}
