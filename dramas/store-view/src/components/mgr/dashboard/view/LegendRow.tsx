import type { ReactNode } from 'react';
import { DASH_PANEL_BG, getColorHalo } from './dashboard-utils';

export function LegendRow({ color, label, percent, value }: { color: string; label: string; percent: number; value: ReactNode }) {
  //
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '4px 8px',
        padding: '8px 9px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: DASH_PANEL_BG,
        fontSize: 11.5,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 0 4px ${getColorHalo(color)}`, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </span>
      <span className="num" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{percent}%</span>
      <span className="num" style={{ gridColumn: '1 / -1', fontWeight: 700, paddingLeft: 16 }}>{value}</span>
    </div>
  );
}
