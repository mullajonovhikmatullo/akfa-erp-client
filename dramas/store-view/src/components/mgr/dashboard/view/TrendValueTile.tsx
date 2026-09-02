import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { DASH_PANEL_BG, getColorHalo } from './dashboard-utils';

export function TrendValueTile({ color, label, value }: { color: string; label: string; value: number }) {
  //
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '4px 8px',
        padding: '8px 9px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: DASH_PANEL_BG,
        fontSize: 11.5,
        minWidth: 0,
      }}
    >
      <span style={{ width: 9, height: 9, marginTop: 4, borderRadius: 999, background: color, boxShadow: `0 0 0 4px ${getColorHalo(color)}` }} />
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span className="num" style={{ gridColumn: '2', fontWeight: 700 }}>
        <MoneyDisplay amount={value} currency="UZS" compact />
      </span>
    </div>
  );
}
