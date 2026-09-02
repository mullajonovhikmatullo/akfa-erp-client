import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Currency } from '@store/store-stub'

export function PriceBox({ label, amount, currency }: { label: string; amount: number; currency: Currency }) {
  //
  return (
    <div className="u-bg-surface-2 u-rounded-8 u-border-default u-p-12-14">
      <div className="u-text-muted u-fs-11 u-mb-4">{label}</div>
      <div className="num u-fs-16 u-fw-700" >
        <MoneyDisplay amount={amount} currency={currency} noConvert />
      </div>
    </div>
  )
}
