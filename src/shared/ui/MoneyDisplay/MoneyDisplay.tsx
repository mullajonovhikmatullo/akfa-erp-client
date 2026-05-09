import { useUIStore } from '@/app/stores/ui.store';
import { formatMoney, toUZS } from '@/shared/lib/formatters';
import type { Currency } from '@/shared/types';

interface MoneyDisplayProps {
  amount: number;
  currency?: Currency;
  compact?: boolean;
  colorize?: boolean;
}

/**
 * Converts to display currency (from ui store) and formats.
 * Use `colorize` to show red for negative values.
 */
export function MoneyDisplay({
  amount,
  currency = 'UZS',
  compact = false,
  colorize = false,
}: MoneyDisplayProps) {
  const displayCurrency = useUIStore((s) => s.displayCurrency);
  const rate = useUIStore((s) => s.exchangeRate);

  let converted = amount;
  if (currency !== displayCurrency) {
    converted =
      currency === 'USD'
        ? amount * rate
        : amount / rate;
  }

  const formatted = formatMoney(converted, displayCurrency, compact);
  const color = colorize ? (amount < 0 ? 'var(--danger)' : amount > 0 ? 'var(--success)' : undefined) : undefined;

  return (
    <span className="num" style={color ? { color } : undefined}>
      {formatted}
    </span>
  );
}
