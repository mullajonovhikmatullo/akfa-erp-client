import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import type { Tone } from './types';

export function TrendValueTile({ tone, label, value }: { tone: Tone; label: string; value: number }) {
  //
  return (
    <div className="dashboard-trend-value-tile">
      <span className={`dashboard-tone-marker dashboard-tone-${tone}`} />
      <span className="u-min-w-0 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{label}</span>
      <span className="num u-fw-700 u-grid-col-2" >
        <MoneyDisplay amount={value} currency="UZS" compact />
      </span>
    </div>
  );
}
