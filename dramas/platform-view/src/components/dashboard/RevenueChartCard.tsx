import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import { formatMillionUZS } from '../../lib/formatters';
import type { RevenueActivity } from '../../types/dashboard';

interface RevenueChartCardProps {
  data: RevenueActivity[];
}

const RevenueTooltip = ({ active, payload, label }: TooltipContentProps) => {
  //
  const rawValue = payload?.[0]?.value;
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);

  if (!active || Number.isNaN(value)) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{formatMillionUZS(value)}</strong>
    </div>
  );
};

export const RevenueChartCard = ({ data }: RevenueChartCardProps) => {
  //
  const latestPoint = data.at(-1);

  return (
    <GlassCard className="revenue-chart-card">
      <SectionHeader title="Daromad faolligi" subtitle="So‘nggi 7 kun" />
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 22, bottom: 6, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.34} />
                <stop offset="96%" stopColor="var(--accent-primary)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <Tooltip content={(props) => <RevenueTooltip {...props} />} cursor={{ stroke: 'var(--accent-primary)', strokeOpacity: 0.18 }} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--accent-primary)"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface-elevated)', fill: 'var(--accent-primary)' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--surface-elevated)' }}
            />
            {latestPoint ? (
              <ReferenceDot
                x={latestPoint.day}
                y={latestPoint.amount}
                r={5}
                fill="var(--accent-primary)"
                stroke="var(--surface-elevated)"
                strokeWidth={2}
                label={{
                  value: formatMillionUZS(latestPoint.amount),
                  position: 'top',
                  fill: 'var(--text-primary)',
                  fontSize: 12,
                }}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
