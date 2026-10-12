import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import type { Currency } from '@store/store-stub';

interface PriceCellProps {
  original: { amount: number; currency: Currency };
  uzs: number;
  listUzs?: number;
  strong?: boolean;
}

export function PriceCell({ original, uzs, listUzs, strong = false }: PriceCellProps) {
  //
  return (
    <div className={`num sale-price-cell${strong ? ' sale-price-cell--strong' : ''}`}>
      {listUzs != null && listUzs !== uzs ? (
        <div className="sale-price-cell__list">
          <MoneyDisplay amount={listUzs} currency="UZS" />
        </div>
      ) : null}
      <MoneyDisplay amount={uzs} currency="UZS" />
      {original.currency === 'USD' ? (
        <div className="u-text-muted u-fs-10-5 u-fw-500 u-whitespace-nowrap">
          <MoneyDisplay amount={original.amount} currency="USD" noConvert />
        </div>
      ) : null}
    </div>
  );
}
