import { formatMoney } from '../../lib/formatters'
import type { Currency } from '../../core/domain'

interface MoneyDisplayProps {
  amount: number
  currency?: Currency
  compact?: boolean
  colorize?: boolean
  noConvert?: boolean
  displayCurrency?: Currency
  exchangeRate?: number
}

export function MoneyDisplay({
  amount,
  currency = 'UZS',
  compact = false,
  colorize = false,
  noConvert = false,
  displayCurrency,
  exchangeRate = 1,
}: MoneyDisplayProps) {
  //
  const effectiveCurrency = noConvert ? currency : displayCurrency ?? currency
  const converted =
    !noConvert && displayCurrency && currency !== displayCurrency
      ? currency === 'USD'
        ? amount * exchangeRate
        : amount / exchangeRate
      : amount

  const formatted = formatMoney(converted, effectiveCurrency, compact)
  const color = colorize ? (amount < 0 ? 'var(--danger)' : amount > 0 ? 'var(--success)' : undefined) : undefined
  const uzsSuffix = " so'm"

  if (effectiveCurrency === 'UZS' && formatted.endsWith(uzsSuffix)) {
    return (
      <span className="num" style={color ? { color } : undefined}>
        {formatted.slice(0, -uzsSuffix.length)} <span className="money-currency">so'm</span>
      </span>
    )
  }

  return (
    <span className="num" style={color ? { color } : undefined}>
      {formatted}
    </span>
  )
}
