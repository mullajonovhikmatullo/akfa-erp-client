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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="analytics-sales-kpis">
        <KpiCard label={t('analytics.kpiRevenue')} value={<MoneyDisplay amount={data.summary.totalRevenue} currency="UZS" />} sub={`${data.summary.saleCount} ${t('analytics.saleSuffix')}`} tone="primary" />
        <KpiCard label={t('analytics.avgSale')} value={<MoneyDisplay amount={data.summary.avgOrderValue} currency="UZS" />} sub={t('analytics.subPerSale')} tone="muted" />
        <KpiCard label={t('analytics.kpiDebtShort')} value={<MoneyDisplay amount={data.summary.outstandingDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <SectionTitle>{t('analytics.byType')}</SectionTitle>
          {data.byType.map((row) => <div key={row.saleType} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 500 }}>{SALE_TYPE_LABELS[row.saleType as SaleType]} ({row.count} {t('common.countSuffix')})</span><span className="num"><MoneyDisplay amount={row.revenue} currency="UZS" /></span></div><ProgressBar pct={(row.revenue / grandTotal) * 100} /></div>)}
        </div>
        <div className="card">
          <SectionTitle>{t('analytics.byPayment')}</SectionTitle>
          {data.byPaymentMethod.map((row) => <div key={row.paymentMethod} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 500 }}>{PAYMENT_METHOD_LABELS[row.paymentMethod as PaymentMethod]} ({row.count})</span><span className="num"><MoneyDisplay amount={row.amount} currency="UZS" /></span></div><ProgressBar pct={(row.amount / grandTotal) * 100} /></div>)}
          {data.byPaymentMethod.length === 0 ? <Empty t={t} /> : null}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>{t('analytics.topProducts')}</div>
        <Table size="small" pagination={false} rowKey="productId" dataSource={data.topProducts} columns={createTopProductColumns(t)} />
      </div>
    </div>
  )
}
