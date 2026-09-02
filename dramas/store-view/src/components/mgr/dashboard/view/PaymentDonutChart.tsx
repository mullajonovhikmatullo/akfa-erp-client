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
    <div className="u-aspect-square u-flex-sidebar u-max-w-full u-relative u-w-278">
      <svg viewBox="0 0 240 240" aria-hidden="true" className="u-block u-h-full u-w-full">
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
            className="u-drop-shadow-soft"
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
                className="u-drop-shadow-soft"
              />
            );
          })
        )}
      </svg>
      <div
        className="dashboard-payment-card__total u-items-center u-bg-surface u-rounded-pill u-shadow-card-inset u-flex u-inset-62 u-justify-center u-pointer-none u-absolute u-text-center"

      >
        <div className="u-min-w-0">
          <div className="u-text-muted u-fs-11 u-mb-4">{totalLabel}</div>
          <div className="num u-fs-17 u-fw-800" >
            <MoneyDisplay amount={total} currency="UZS" />
          </div>
        </div>
      </div>
    </div>
  );
}
