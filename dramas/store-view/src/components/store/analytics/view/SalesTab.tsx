import { Skeleton, Table } from 'antd'
import { PAYMENT_METHOD_LABELS, SALE_TYPE_LABELS } from '@store/store-shared/core'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { SalesReportData, PaymentMethod, SaleType } from '@store/store-stub'
import { Empty, KpiCard, ProgressBar, SectionTitle } from './AnalyticsShared'
import { createTopProductColumns } from './analyticsColumns'
import type { TFunc } from './types'

export function SalesTab({ data, loading, t }: { data?: SalesReportData; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />
  const grandTotal = data.summary.totalRevenue || 1

  return (
    <div className="u-flex u-flex-col u-gap-12">
      <div className="analytics-sales-kpis">
        <KpiCard label={t('analytics.kpiRevenue')} value={<MoneyDisplay amount={data.summary.totalRevenue} currency="UZS" />} sub={`${data.summary.saleCount} ${t('analytics.saleSuffix')}`} tone="primary" />
        <KpiCard label={t('analytics.avgSale')} value={<MoneyDisplay amount={data.summary.avgOrderValue} currency="UZS" />} sub={t('analytics.subPerSale')} tone="muted" />
        <KpiCard label={t('analytics.kpiDebtShort')} value={<MoneyDisplay amount={data.summary.outstandingDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
      </div>
      <div className="u-grid u-gap-12 u-grid-cols-2">
        <div className="card">
          <SectionTitle>{t('analytics.byType')}</SectionTitle>
          {data.byType.map((row) => <div key={row.saleType} className="u-mb-12"><div className="u-flex u-fs-13 u-justify-between u-mb-4"><span className="u-fw-500">{SALE_TYPE_LABELS[row.saleType as SaleType]} ({row.count} {t('common.countSuffix')})</span><span className="num"><MoneyDisplay amount={row.revenue} currency="UZS" /></span></div><ProgressBar pct={(row.revenue / grandTotal) * 100} /></div>)}
        </div>
        <div className="card">
          <SectionTitle>{t('analytics.byPayment')}</SectionTitle>
          {data.byPaymentMethod.map((row) => <div key={row.paymentMethod} className="u-mb-12"><div className="u-flex u-fs-13 u-justify-between u-mb-4"><span className="u-fw-500">{PAYMENT_METHOD_LABELS[row.paymentMethod as PaymentMethod]} ({row.count})</span><span className="num"><MoneyDisplay amount={row.amount} currency="UZS" /></span></div><ProgressBar pct={(row.amount / grandTotal) * 100} /></div>)}
          {data.byPaymentMethod.length === 0 ? <Empty t={t} /> : null}
        </div>
      </div>
      <div className="card u-overflow-hidden u-p-0" >
        <div className="u-border-b-default u-fs-13 u-fw-700 u-p-14-16">{t('analytics.topProducts')}</div>
        <Table size="small" pagination={false} rowKey="productId" dataSource={data.topProducts} columns={createTopProductColumns(t)} />
      </div>
    </div>
  )
}
