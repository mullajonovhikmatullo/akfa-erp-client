import { MoneyDisplay } from '@store/store-shared/ui/money-display'

interface ExpenseKpiItem {
  id: string
  name: string
  total: number
}

export function ExpenseKpiCards({ items, grandTotal, t }: { items: ExpenseKpiItem[]; grandTotal: number; t: (key: string) => string }) {
  //
  if (items.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x proximity' }}>
      {items.map((item) => {
        //
        const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
        return (
          <div key={item.id} className="card" style={{ padding: '14px 16px', flex: '1 0 190px', minWidth: 190, maxWidth: 240, scrollSnapAlign: 'start' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{item.name}</div>
            <div className="num" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}><MoneyDisplay amount={item.total} currency="UZS" /></div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{pct.toFixed(0)}% {t('expenses.pctSuffix')}</div>
          </div>
        )
      })}
    </div>
  )
}
