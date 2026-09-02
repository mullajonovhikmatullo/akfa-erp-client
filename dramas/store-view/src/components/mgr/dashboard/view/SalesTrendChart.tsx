import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactUZS } from '@store/store-shared/lib/formatters';
import { DASH_DOT_FILL, DASH_GRID, DASH_PANEL_BG, DASH_TICK, DASH_TOOLTIP_STYLE, COLORS } from './dashboard-utils';
import type { TrendDatum } from './types';
import { TrendValueTile } from './TrendValueTile';

export function SalesTrendChart({
  data,
  revenueLabel,
  debtLabel,
  expensesLabel,
}: {
  data: TrendDatum[];
  revenueLabel: string;
  debtLabel: string;
  expensesLabel: string;
}) {
  //
  const series: { key: 'revenue' | 'debt' | 'expenses'; label: string; color: string; gradientId: string }[] = [
    { key: 'revenue', label: revenueLabel, color: COLORS.primary, gradientId: 'dashRevenue' },
    { key: 'debt', label: debtLabel, color: COLORS.danger, gradientId: 'dashDebt' },
    { key: 'expenses', label: expensesLabel, color: COLORS.warning, gradientId: 'dashExpenses' },
  ];
  const values = data.flatMap((item) => series.map((itemSeries) => item[itemSeries.key]));
  const maxValue = Math.max(0, ...values);
  const yMax = maxValue > 0 ? maxValue * 1.18 : 1;
  const isSinglePoint = data.length <= 1;
  const chartType = isSinglePoint ? 'linear' : 'monotone';
  const dotProps = isSinglePoint
    ? { r: 5, strokeWidth: 2, fill: DASH_DOT_FILL }
    : data.length <= 7
      ? { r: 2.5, strokeWidth: 1.5, fill: DASH_DOT_FILL }
      : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          minHeight: 254,
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: DASH_PANEL_BG,
          padding: '8px 8px 2px',
        }}
      >
        <ResponsiveContainer width="100%" height={244}>
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.24} />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashDebt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.18} />
                <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.16} />
                <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={DASH_GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
              interval={0}
              padding={{ left: isSinglePoint ? 62 : 8, right: isSinglePoint ? 62 : 8 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickFormatter={(v) => formatCompactUZS(Number(v)).replace(" so'm", '')}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
              width={52}
            />
            <Tooltip
              contentStyle={DASH_TOOLTIP_STYLE}
              labelStyle={{ color: 'var(--ink-2)' }}
              itemStyle={{ color: 'var(--ink-2)' }}
              formatter={(v) => formatCompactUZS(Number(v))}
            />
            {series.map((item) => (
              <Area
                key={item.key}
                type={chartType}
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2.25}
                fill={`url(#${item.gradientId})`}
                dot={dotProps}
                activeDot={{ r: 6, strokeWidth: 2, fill: DASH_DOT_FILL }}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))', gap: 7 }}>
        {series.map((item) => (
          <TrendValueTile
            key={item.key}
            color={item.color}
            label={item.label}
            value={data.reduce((sum, row) => sum + row[item.key], 0)}
          />
        ))}
      </div>
    </div>
  );
}
