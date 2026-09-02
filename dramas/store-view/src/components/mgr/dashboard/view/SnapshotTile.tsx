import type { ReactNode } from 'react';
import { DASH_PANEL_BG, COLORS, getColorHalo } from './dashboard-utils';
import type { Tone } from './types';

export function SnapshotTile({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: Tone }) {
  //
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '34px 1fr auto',
        alignItems: 'center',
        gap: 10,
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        background: DASH_PANEL_BG,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: getColorHalo(COLORS[tone]),
          color: COLORS[tone],
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0, color: 'var(--ink-2)', fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 16, fontWeight: 800, color: COLORS[tone], textAlign: 'right' }}>{value}</div>
    </div>
  );
}
