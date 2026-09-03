import { Skeleton } from 'antd'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { DashboardData } from '@store/store-stub'
import { KpiCard, SectionTitle } from './AnalyticsShared'
import type { TFunc } from './types'

export function DashboardTab({ data, loading, t }: { data?: DashboardData; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />
  const kpis = [
    { label: t('analytics.kpiRevenue'), value: <MoneyDisplay amount={data.sales.totalRevenue} currency="UZS" />, sub: `${data.sales.saleCount} ${t('analytics.saleSuffix')}`, tone: 'primary' },
    { label: t('analytics.kpiPaid'), value: <MoneyDisplay amount={data.sales.paidAmount} currency="UZS" />, sub: t('analytics.subCashCard'), tone: 'success' },
    { label: t('analytics.kpiSaleDebt'), value: <MoneyDisplay amount={data.sales.outstandingDebt} currency="UZS" />, sub: t('analytics.subUnpaid'), tone: 'danger' },
    { label: t('analytics.kpiExpenses'), value: <MoneyDisplay amount={data.expenses.total} currency="UZS" />, sub: t('analytics.subAllCategories'), tone: 'warning' },
    { label: t('analytics.kpiNetProfit'), value: <MoneyDisplay amount={data.profit.netProfit} currency="UZS" />, sub: t('analytics.subProfitFormula'), tone: data.profit.netProfit >= 0 ? 'success' : 'danger' },
    { label: t('analytics.kpiStockValue'), value: <MoneyDisplay amount={data.inventory.stockValueUzs} currency="UZS" />, sub: t('analytics.subAtCost'), tone: 'muted' },
    { label: t('analytics.kpiCustomerDebt'), value: <MoneyDisplay amount={data.customers.totalDebt} currency="UZS" />, sub: `${data.customers.debtorCount} ${t('analytics.debtorSuffix')}`, tone: 'danger' },
    { label: t('analytics.kpiLowStock'), value: data.inventory.lowStockCount, sub: t('analytics.subLowStock'), tone: data.inventory.lowStockCount > 0 ? 'warning' : 'success' },
    { label: t('analytics.kpiPendingTransfers'), value: data.transfers.pendingCount, sub: t('analytics.subNeedReview'), tone: data.transfers.pendingCount > 0 ? 'warning' : 'success' },
  ]
  const revenueBase = Math.max(data.sales.totalRevenue, 1)
  const financialRows = [
    { label: t('analytics.kpiPaid'), value: data.sales.paidAmount, pct: (data.sales.paidAmount / revenueBase) * 100, tone: 'success' },
    { label: t('analytics.kpiSaleDebt'), value: data.sales.outstandingDebt, pct: (data.sales.outstandingDebt / revenueBase) * 100, tone: 'danger' },
    { label: t('analytics.kpiExpenses'), value: data.expenses.total, pct: (data.expenses.total / revenueBase) * 100, tone: 'warning' },
    { label: t('analytics.kpiNetProfit'), value: data.profit.netProfit, pct: (Math.abs(data.profit.netProfit) / revenueBase) * 100, tone: data.profit.netProfit >= 0 ? 'success' : 'danger' },
  ]

  return (
    <div className="analytics-overview">
      <div className="analytics-overview-grid">{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div>
      <div className="analytics-overview-details">
        <section className="card analytics-overview-panel">
          <SectionTitle>{t('analytics.financialSummary')}</SectionTitle>
          <div className="analytics-overview-finance">
            {financialRows.map((row) => (
              <div className="analytics-overview-finance__row" key={row.label}>
                <div className="analytics-overview-finance__head"><span>{row.label}</span><strong><MoneyDisplay amount={row.value} currency="UZS" /></strong></div>
                <div className="analytics-overview-finance__track"><span className={`tone-bg-${row.tone} u-w-pct-${Math.round(Math.min(row.pct, 100))}`} /></div>
                <small>{Math.round(row.pct)}%</small>
              </div>
            ))}
          </div>
        </section>
        <section className="card analytics-overview-panel">
          <SectionTitle>{t('analytics.operationalSummary')}</SectionTitle>
          <div className="analytics-overview-status">
            <div><span>{t('analytics.kpiStockValue')}</span><strong><MoneyDisplay amount={data.inventory.stockValueUzs} currency="UZS" /></strong></div>
            <div><span>{t('analytics.kpiLowStock')}</span><strong className={data.inventory.lowStockCount > 0 ? 'is-warning' : 'is-success'}>{data.inventory.lowStockCount}</strong></div>
            <div><span>{t('analytics.kpiPendingTransfers')}</span><strong className={data.transfers.pendingCount > 0 ? 'is-warning' : 'is-success'}>{data.transfers.pendingCount}</strong></div>
            <div><span>{t('analytics.kpiCustomerDebt')}</span><strong className={data.customers.debtorCount > 0 ? 'is-danger' : 'is-success'}>{data.customers.debtorCount} {t('analytics.debtorSuffix')}</strong></div>
          </div>
        </section>
      </div>
    </div>
  )
}
