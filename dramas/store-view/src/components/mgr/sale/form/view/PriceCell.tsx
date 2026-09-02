import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import type { Currency } from '@store/store-stub';

interface PriceCellProps {
  original: { amount: number; currency: Currency };
  uzs: number;
  strong?: boolean;
}

export function PriceCell({ original, uzs, strong = false }: PriceCellProps) {
  //
  return (
    <div className="num" style={{ textAlign: 'right', fontWeight: strong ? 700 : undefined, fontSize: 13, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
      <MoneyDisplay amount={uzs} currency="UZS" />
      {original.currency === 'USD' ? (
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          <MoneyDisplay amount={original.amount} currency="USD" noConvert />
        </div>
      ) : null}
    </div>
  );
}
