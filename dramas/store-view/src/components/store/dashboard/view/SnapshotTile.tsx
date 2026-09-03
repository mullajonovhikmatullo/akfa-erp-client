import type { ReactNode } from 'react';
import type { Tone } from './types';

export function SnapshotTile({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: Tone }) {
  //
  return (
    <div className={`dashboard-snapshot-tile dashboard-tone-${tone}`}>
      <span className="dashboard-snapshot-tile__icon">
        {icon}
      </span>
      <div className="u-text-secondary u-fs-13 u-fw-650 u-min-w-0 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">
        {label}
      </div>
      <div className="num dashboard-snapshot-tile__value">{value}</div>
    </div>
  );
}
