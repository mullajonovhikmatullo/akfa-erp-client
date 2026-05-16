import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useCurrentUser } from '@/entities/user';
import { formatCompactUZS } from '@/shared/lib/formatters';
import { useDailySeries } from '../model/useDailySeries';
import { useT } from '@/shared/lib/i18n';

export function RevenueChartWidget() {
  const t = useT();
  const { isSuper, branchId } = useCurrentUser();
  const branchFilter = isSuper ? null : branchId;
  const data = useDailySeries(branchFilter);

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('dashboard.chartTitle')}</h3>
        <span className="meta">{t('dashboard.chartMeta')}</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e4dd8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1e4dd8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(15,23,42,.06)" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis
            tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`)}
            tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={48}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e6e9ef', fontSize: 12 }}
            formatter={(v) => formatCompactUZS(Number(v))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="revenue" name={t('dashboard.chartRevenue')} stroke="#1e4dd8" strokeWidth={2} fill="url(#gRev)" />
          <Area type="monotone" dataKey="expenses" name={t('dashboard.chartExpenses')} stroke="#dc2626" strokeWidth={2} fill="url(#gExp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
