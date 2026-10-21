import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Currency } from '@store/store-stub'

interface PriceBoxProps {
  label: string
  amount: number
  currency: Currency
  discountedAmount?: number
}

export function PriceBox({ label, amount, currency, discountedAmount }: PriceBoxProps) {
  //
  const discounted = discountedAmount != null && discountedAmount !== amount
  return (
    <div className="u-bg-surface-2 u-rounded-8 u-border-default u-p-12-14">
      <div className="u-text-muted u-fs-11 u-mb-4">{label}</div>
      {discounted ? (
        <div className="sale-price-cell__list">
          <MoneyDisplay amount={amount} currency={currency} noConvert />
        </div>
      ) : null}
      <div className={`num u-fs-16 u-fw-700${discounted ? ' u-text-success' : ''}`}>
        <MoneyDisplay amount={discounted ? discountedAmount : amount} currency={currency} noConvert />
      </div>
    </div>
  )
}
