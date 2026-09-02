import type { ReactNode } from 'react';
import type { Tone } from './types';

export function SmallStat({ label, value, tone }: { label: string; value: ReactNode; tone: Tone }) {
  //
  return (
    <div className="card u-p-14-16" >
      <div className="u-text-muted u-fs-12 u-mb-6">{label}</div>
      <div className={`num dashboard-small-stat tone-${tone}`}>{value}</div>
    </div>
  );
}
