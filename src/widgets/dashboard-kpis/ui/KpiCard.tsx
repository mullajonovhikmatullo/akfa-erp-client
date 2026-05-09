import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaUp?: boolean;
  hint?: string;
  sparkline?: number[];
  accent?: string;
}

function Sparkbar({ values, color = 'var(--primary)' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: `${(v / max) * 100}%`,
            minHeight: 2,
            background: color,
            opacity: 0.35 + 0.65 * (v / max),
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

export function KpiCard({ label, value, delta, deltaUp, hint, sparkline, accent }: KpiCardProps) {
  return (
    <div className="kpi">
      <div className="accent" style={accent ? { background: accent } : undefined} />
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, marginTop: 2 }}>
        <div>
          {delta != null && (
            <span className={`delta ${deltaUp ? 'up' : 'down'}`}>
              {deltaUp ? '▲' : '▼'} {delta}
            </span>
          )}
          {hint && <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>{hint}</div>}
        </div>
        {sparkline && <Sparkbar values={sparkline} />}
      </div>
    </div>
  );
}
