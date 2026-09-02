import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { describeArc } from './dashboard-utils';
import type { PaymentChartDatum } from './types';

export function PaymentDonutChart({ data, total, totalLabel }: { data: PaymentChartDatum[]; total: number; totalLabel: string }) {
  //
  const center = 120;
  const radius = 82;
  const strokeWidth = 26;
  const hasSingleSegment = data.length === 1;
  let cursor = 0;
  const segments = data.map((item) => {
    //
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const gap = hasSingleSegment ? 0 : Math.min(4, angle * 0.28);
    const startAngle = cursor + gap / 2;
    const endAngle = cursor + angle - gap / 2;
    cursor += angle;
    return { ...item, startAngle, endAngle };
  });

  return (
    <div style={{ position: 'relative', flex: '0 0 clamp(250px, 52%, 278px)', width: 278, maxWidth: '100%', aspectRatio: '1 / 1' }}>
      <svg viewBox="0 0 240 240" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        {hasSingleSegment ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={data[0]?.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 8px 14px rgba(15, 23, 42, .10))' }}
          />
        ) : (
          segments.map((segment) => {
            //
            if (segment.endAngle - segment.startAngle <= 0.5) return null;
            return (
              <path
                key={segment.name}
                d={describeArc(center, center, radius, segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 8px 14px rgba(15, 23, 42, .10))' }}
              />
            );
          })
        )}
      </svg>
      <div
        className="dashboard-payment-card__total"
        style={{
          position: 'absolute',
          inset: 62,
          borderRadius: 999,
          background: 'var(--surface)',
          boxShadow: 'inset 0 0 0 1px var(--border), 0 10px 24px rgba(2,6,23,.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{totalLabel}</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 800 }}>
            <MoneyDisplay amount={total} currency="UZS" />
          </div>
        </div>
      </div>
    </div>
  );
}
