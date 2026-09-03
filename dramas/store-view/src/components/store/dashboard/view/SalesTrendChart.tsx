import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactUZS } from '@store/store-shared/lib/formatters';
import { DASH_DOT_FILL, DASH_GRID, DASH_TICK, COLORS } from './dashboard-utils';
import type { Tone, TrendDatum } from './types';
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
  const series: { key: 'revenue' | 'debt' | 'expenses'; label: string; color: string; tone: Tone; gradientId: string }[] = [
    { key: 'revenue', label: revenueLabel, color: COLORS.primary, tone: 'primary', gradientId: 'dashRevenue' },
    { key: 'debt', label: debtLabel, color: COLORS.danger, tone: 'danger', gradientId: 'dashDebt' },
    { key: 'expenses', label: expensesLabel, color: COLORS.warning, tone: 'warning', gradientId: 'dashExpenses' },
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
    <div className="u-flex u-flex-col u-gap-10">
      <div className="dashboard-sales-trend-chart">
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
              wrapperClassName="dashboard-recharts-tooltip"
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

      <div className="u-grid u-gap-7 u-grid-cols-fit-138">
        {series.map((item) => (
          <TrendValueTile
            key={item.key}
            tone={item.tone}
            label={item.label}
            value={data.reduce((sum, row) => sum + row[item.key], 0)}
          />
        ))}
      </div>
    </div>
  );
}
