import type { ReactNode } from 'react';
import type { Tone } from './types';

export function MetricCard({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: ReactNode; sub: string; tone: Tone }) {
  //
  return (
    <div className="kpi dashboard-metric-kpi u-min-h-126" >
      <div className="u-items-start u-flex u-gap-10 u-justify-between">
        <div className="label">{label}</div>
        <span className={`dashboard-metric-icon tone-${tone}`}>{icon}</span>
      </div>
      <div className="value">{value}</div>
      <div className="u-text-muted u-fs-12">{sub}</div>
      <div className="accent" />
    </div>
  );
}
