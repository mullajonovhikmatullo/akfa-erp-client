import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Currency } from '@store/store-stub'

export function PriceBox({ label, amount, currency }: { label: string; amount: number; currency: Currency }) {
  //
  return (
    <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
        <MoneyDisplay amount={amount} currency={currency} noConvert />
      </div>
    </div>
  )
}
