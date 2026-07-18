import { useUIStore } from '@/app/stores/ui.store';
import { formatMoney, toUZS } from '@/shared/lib/formatters';
import type { Currency } from '@/shared/types';

interface MoneyDisplayProps {
  amount: number;
  currency?: Currency;
  compact?: boolean;
  colorize?: boolean;
  noConvert?: boolean;
}

/**
 * Converts to display currency (from ui store) and formats.
 * Pass `noConvert` to skip conversion and show the amount in its stored currency.
 * Use `colorize` to show red for negative values.
 */
export function MoneyDisplay({
  amount,
  currency = 'UZS',
  compact = false,
  colorize = false,
  noConvert = false,
}: MoneyDisplayProps) {
  const displayCurrency = useUIStore((s) => s.displayCurrency);
  const rate = useUIStore((s) => s.exchangeRate);

  let converted = amount;
  const effectiveCurrency = noConvert ? currency : displayCurrency;
  if (!noConvert && currency !== displayCurrency) {
    converted =
      currency === 'USD'
        ? amount * rate
        : amount / rate;
  }

  const formatted = formatMoney(converted, effectiveCurrency, compact);
  const color = colorize ? (amount < 0 ? 'var(--danger)' : amount > 0 ? 'var(--success)' : undefined) : undefined;
  const uzsSuffix = " so'm";

  if (effectiveCurrency === 'UZS' && formatted.endsWith(uzsSuffix)) {
    return (
      <span className="num" style={color ? { color } : undefined}>
        {formatted.slice(0, -uzsSuffix.length)}{' '}
        <span className="money-currency">so'm</span>
      </span>
    );
  }

  return (
    <span className="num" style={color ? { color } : undefined}>
      {formatted}
    </span>
  );
}
