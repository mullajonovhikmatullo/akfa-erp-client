import { useState } from 'react';
import { Empty, Segmented, Skeleton } from 'antd';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactUZS } from '@store/store-shared/lib/formatters';
import type { AnalyticsQuery } from '@store/store-stub';
import { useSalesReport } from '../../analytics';
import { DASH_GRID, DASH_TICK, TOP_PRODUCTS_LIMIT, getChartColor } from './dashboard-utils';
import { TopProductsTooltip } from './TopProductsTooltip';
import type { TFunc, TopProductChartDatum } from './types';

export function TopProductsCard({ t, query, periodMeta }: { t: TFunc; query: AnalyticsQuery; periodMeta: string }) {
  //
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity'>('revenue');
  const report = useSalesReport({ ...query, topProductsSort: sortBy });
  const products = (report.data?.topProducts ?? []).slice(0, TOP_PRODUCTS_LIMIT);
  const chartData: TopProductChartDatum[] = products.map((product, index) => ({
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    quantity: product.totalQuantity,
    revenue: product.totalRevenue,
    color: getChartColor(index),
  }));

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('dashboard.topProducts')}</h3>
        <div className="dashboard-top-products__controls">
          <Segmented
            size="small"
            value={sortBy}
            onChange={(value) => setSortBy(value as 'revenue' | 'quantity')}
            options={[
              { value: 'quantity', label: t('dashboard.sortByQuantity') },
              { value: 'revenue', label: t('dashboard.sortByRevenue') },
            ]}
          />
          <span className="meta">{periodMeta}</span>
        </div>
      </div>

      {report.isLoading ? (
        <div style={{ height: 360, display: 'grid', alignContent: 'center', gap: 14, padding: '16px 20px' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton.Input key={index} active size="small" style={{ width: `${92 - index * 9}%` }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 14, top: 8, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid stroke={DASH_GRID} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => sortBy === 'revenue'
                ? formatCompactUZS(Number(value)).replace(" so'm", '')
                : Number(value).toLocaleString('ru-RU')}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
            />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: DASH_TICK }} width={120} interval={0} tickFormatter={(value) => String(value).length > 18 ? `${String(value).slice(0, 18)}...` : String(value)} />
            <Tooltip
              content={<TopProductsTooltip revenueLabel={t('common.revenue')} quantityLabel={t('dashboard.soldQuantity')} skuLabel={t('products.productCode')} unitLabel={(unit) => t(`units.${unit}`)} />}
              cursor={{ fill: 'var(--primary-soft)', fillOpacity: 0.58, radius: 8 }}
              allowEscapeViewBox={{ x: false, y: false }}
              offset={12}
              isAnimationActive={false}
            />
            <Bar dataKey={sortBy} name={sortBy === 'revenue' ? t('common.revenue') : t('dashboard.soldQuantity')} radius={[0, 6, 6, 0]} barSize={16}>
              {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
