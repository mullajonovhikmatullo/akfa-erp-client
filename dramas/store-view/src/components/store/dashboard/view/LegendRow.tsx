import type { ReactNode } from 'react';
import { getDashboardColorClass } from './dashboard-utils';

export function LegendRow({ color, label, percent, value }: { color: string; label: string; percent: number; value: ReactNode }) {
  //
  return (
    <div className="dashboard-legend-row">
      <span className="u-items-center u-inline-flex u-gap-7 u-min-w-0">
        <span className={`dashboard-color-marker ${getDashboardColorClass(color)}`} />
        <span className="u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{label}</span>
      </span>
      <span className="num u-text-muted u-fw-700" >{percent}%</span>
      <span className="num u-fw-700 u-grid-col-full u-pl-16" >{value}</span>
    </div>
  );
}
