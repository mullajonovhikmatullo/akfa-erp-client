import type { StoreTranslator } from '@store/store-i18n'
import { Skeleton } from 'antd'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCompactUZS, formatUZS } from '@store/store-shared/lib/formatters'
import type { CustomerMonthlyPurchase } from '@store/store-stub'
import { COLORS, DASH_GRID, DASH_TICK } from '../../../dashboard/view/dashboard-utils'

interface CustomerPurchasesChartProps {
  t: StoreTranslator
  monthly?: CustomerMonthlyPurchase[]
  loading: boolean
}

function monthLabel(month: string) {
  //
  const [year, value] = month.split('-')
  return `${value}.${year?.slice(2)}`
}

export function CustomerPurchasesChart({ t, monthly, loading }: CustomerPurchasesChartProps) {
  //
  const data = (monthly ?? []).map((row) => ({ ...row, label: monthLabel(row.month) }))
  const hasPurchases = data.some((row) => row.salesCount > 0)

  return (
    <div className="card u-p-16-20">
      <div className="u-fs-13 u-fw-700 u-mb-14">{t('customerDetail.chartTitle')}</div>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !hasPurchases ? (
        <div className="customer-chart-empty">{t('customerDetail.chartEmpty')}</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barGap={2}>
            <CartesianGrid stroke={DASH_GRID} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: DASH_TICK }} />
            <YAxis
              tickFormatter={(value) => formatCompactUZS(Number(value)).replace(' UZS', '')}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
              width={52}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              formatter={(value, name) => [formatUZS(Number(value)), name]}
              labelFormatter={(label, payload) => {
                //
                const count = payload?.[0]?.payload?.salesCount ?? 0
                return `${label} · ${count} ${t('common.countSuffix')}`
              }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="totalAmountUzs" name={t('customerDetail.chartPurchases')} fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="paidAmountUzs" name={t('customerDetail.chartPaid')} fill={COLORS.success} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
