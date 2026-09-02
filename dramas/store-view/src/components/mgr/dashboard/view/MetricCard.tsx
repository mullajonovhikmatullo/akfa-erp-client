import type { ReactNode } from 'react';
import { COLORS } from './dashboard-utils';
import type { Tone } from './types';

export function MetricCard({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: ReactNode; sub: string; tone: Tone }) {
  //
  return (
    <div className="kpi dashboard-metric-kpi" style={{ minHeight: 126 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div className="label">{label}</div>
        <span style={{ color: COLORS[tone], fontSize: 18 }}>{icon}</span>
      </div>
      <div className="value">{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>
      <div className="accent" />
    </div>
  );
}
