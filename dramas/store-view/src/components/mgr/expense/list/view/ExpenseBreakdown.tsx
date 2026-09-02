import { MoneyDisplay } from '@store/store-shared/ui/money-display'

interface ExpenseBreakdownItem {
  id: string
  name: string
  total: number
}

export function ExpenseBreakdown({ items, grandTotal, t }: { items: ExpenseBreakdownItem[]; grandTotal: number; t: (key: string) => string }) {
  //
  return (
    <div className="card" style={{ position: 'sticky', top: 76 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('expenses.breakdown')}</div>
      {items.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('common.noData')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => {
            //
            const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
            return (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{item.name}</span>
                  <span className="num" style={{ color: 'var(--ink-3)' }}>{pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                </div>
                <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}><MoneyDisplay amount={item.total} currency="UZS" /></div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span style={{ color: 'var(--ink-3)' }}>{t('common.total')}</span>
        <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={grandTotal} currency="UZS" /></span>
      </div>
    </div>
  )
}
