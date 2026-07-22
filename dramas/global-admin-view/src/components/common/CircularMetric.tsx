import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { AccentTone } from '../../types/dashboard';

interface CircularMetricProps {
  value: number;
  label: string;
  accent: AccentTone;
  centerLabel?: string;
}

const accentColor: Record<AccentTone, string> = {
  primary: 'var(--accent-primary)',
  success: 'var(--success-color)',
  warning: 'var(--warning-color)',
  danger: 'var(--danger-color)',
  purple: 'var(--accent-purple)',
  neutral: 'var(--text-muted)',
};

export const CircularMetric = ({ value, label, accent, centerLabel }: CircularMetricProps) => {
  //
  const normalizedValue = Math.max(0, Math.min(100, value));
  const displayLabel = centerLabel ?? `${normalizedValue}%`;
  const currencyMatch = displayLabel.match(/^(.*)\s(UZS)$/);
  const primaryLabel = currencyMatch?.[1] ?? displayLabel;
  const secondaryLabel = currencyMatch?.[2];
  const chartData = [
    { name: 'progress', value: normalizedValue },
    { name: 'rest', value: 100 - normalizedValue },
  ];

  return (
    <div className="circular-metric" aria-label={`${label}: ${normalizedValue}%`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive
          >
            <Cell fill={accentColor[accent]} />
            <Cell fill="var(--progress-track)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className="circular-metric__label">
        <strong>{primaryLabel}</strong>
        {secondaryLabel ? <small>{secondaryLabel}</small> : null}
      </span>
    </div>
  );
};
