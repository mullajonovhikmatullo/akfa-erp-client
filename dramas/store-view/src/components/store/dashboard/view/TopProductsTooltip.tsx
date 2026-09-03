import { formatCompactUZS } from '@store/store-shared/lib/formatters';
import { getDashboardColorClass } from './dashboard-utils';
import type { TopProductChartDatum } from './types';

export function TopProductsTooltip({
  active,
  payload,
  revenueLabel,
  quantityLabel,
  skuLabel,
  unitLabel,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: TopProductChartDatum }>;
  revenueLabel: string;
  quantityLabel: string;
  skuLabel: string;
  unitLabel: (unit: string) => string;
}) {
  //
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="dashboard-chart-tooltip">
      <div className="dashboard-chart-tooltip__head">
        <span className={`dashboard-chart-tooltip__marker ${getDashboardColorClass(item.color)}`} />
        <div className="dashboard-chart-tooltip__title-wrap">
          <div className="dashboard-chart-tooltip__title">{item.name}</div>
          {item.sku && <div className="dashboard-chart-tooltip__meta">{skuLabel}: {item.sku}</div>}
        </div>
      </div>
      <div className="dashboard-chart-tooltip__rows">
        <div className="dashboard-chart-tooltip__row">
          <span>{revenueLabel}</span>
          <strong className="num">{formatCompactUZS(item.revenue)}</strong>
        </div>
        <div className="dashboard-chart-tooltip__row">
          <span>{quantityLabel}</span>
          <strong className="num">
            {item.quantity.toLocaleString('ru-RU')} {unitLabel(item.unit)}
          </strong>
        </div>
      </div>
    </div>
  );
}
