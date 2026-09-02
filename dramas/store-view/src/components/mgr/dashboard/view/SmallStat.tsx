import type { ReactNode } from 'react';
import { COLORS } from './dashboard-utils';
import type { Tone } from './types';

export function SmallStat({ label, value, tone }: { label: string; value: ReactNode; tone: Tone }) {
  //
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 18, fontWeight: 800, color: COLORS[tone] }}>{value}</div>
    </div>
  );
}
