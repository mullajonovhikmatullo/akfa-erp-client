import { Alert, Select, Skeleton, Table } from 'antd'

import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { CustomerDebtData, SaleListItem, SaleType } from '@store/store-stub'
import { KpiCard } from './AnalyticsShared'
import { createDebtColumns, formatCompactAmount, sortDebtRows } from './analyticsColumns'
import type { DebtDeadlineFilter, DebtScope, DebtSort, TFunc } from './types'

interface DebtTabProps {
  data?: CustomerDebtData
  loading: boolean
  t: TFunc
  debtSales?: SaleListItem[]
  debtLoading: boolean
  debtFetching: boolean
  debtScope: DebtScope
  debtDeadlineFilter: DebtDeadlineFilter
  debtSort: DebtSort
  debtCustomerId?: string
  debtSaleType?: SaleType
  onDebtScopeChange: (value: DebtScope) => void
  onDebtDeadlineChange: (value: DebtDeadlineFilter) => void
  onDebtSortChange: (value: DebtSort) => void
  onDebtCustomerChange: (value?: string) => void
  onDebtSaleTypeChange: (value?: SaleType) => void
}

export function DebtTab({
  data,
  loading,
  t,
  debtSales,
  debtLoading,
  debtFetching,
  debtScope,
  debtDeadlineFilter,
  debtSort,
  debtCustomerId,
  debtSaleType,
  onDebtScopeChange,
  onDebtDeadlineChange,
  onDebtSortChange,
  onDebtCustomerChange,
  onDebtSaleTypeChange,
}: DebtTabProps) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />
  const debtRows = [...(debtSales ?? [])].filter((sale) => debtDeadlineFilter === 'withDeadline' ? Boolean(sale.debtDueDate) : debtDeadlineFilter === 'withoutDeadline' ? !sale.debtDueDate : true).sort((a, b) => sortDebtRows(a, b, debtSort))
  const debtTotal = debtRows.length
  const tableTitle = debtScope === 'overdue' ? t('analytics.overduePayments') : t('analytics.debtPayments')
  const emptyText = debtScope === 'overdue' ? t('analytics.noOverduePayments') : t('analytics.noDebtPayments')
  const topDebtorOptions = data.topDebtors.map((customer) => ({
    value: customer.id,
    searchLabel: customer.fullName,
    label: <span className="u-items-center u-flex u-gap-12 u-justify-between"><span className="u-min-w-0 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{customer.fullName}</span><span className="num u-text-danger u-flex-none u-fw-700" >{formatCompactAmount(customer.balance)}</span></span>,
  }))

  return (
    <div className="analytics-debt">
      <div className="analytics-debt-kpis">
        <KpiCard label={t('analytics.totalDebt')} value={<MoneyDisplay amount={data.summary.totalDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
        <KpiCard label={t('analytics.overdueDebt')} value={<MoneyDisplay amount={data.overdue.totalOverdueDebt} currency="UZS" />} sub={`${data.overdue.overdueCount} ${t('analytics.saleSuffix')}`} tone="danger" />
        <KpiCard label={t('dashboard.debtorCount')} value={data.summary.debtorCount} sub={t('analytics.debtorsNeedAttention')} tone={data.summary.debtorCount > 0 ? 'warning' : 'success'} />
      </div>
      {data.overdue.overdueCount > 0 ? <Alert type="warning" showIcon message={`${data.overdue.overdueCount} ${t('analytics.alertOverdueSuffix')}`} /> : null}
      <div className="card u-overflow-hidden u-p-0" >
        <div className="u-items-center u-border-b-default u-flex u-flex-wrap u-gap-12 u-justify-between u-p-14-16">
          <div className="u-items-center u-flex u-fs-13 u-fw-700 u-gap-8"><i className="icons-warning icon-size-18 u-text-warning" />{tableTitle}</div>
          <span className="u-text-muted u-fs-12-5"><strong>{debtTotal}</strong> {t('common.resultsSuffix')}</span>
        </div>
        <div className="analytics-debt-filters">
          <Select<DebtScope> value={debtScope} onChange={onDebtScopeChange} className="u-w-full" options={[{ value: 'overdue', label: t('analytics.scopeOverdue') }, { value: 'allDebt', label: t('analytics.scopeAllDebt') }]} />
          <Select<DebtDeadlineFilter> value={debtDeadlineFilter} onChange={onDebtDeadlineChange} className="u-w-full" options={[{ value: 'all', label: t('analytics.deadlineAll') }, { value: 'withDeadline', label: t('analytics.deadlineSet') }, { value: 'withoutDeadline', label: t('analytics.deadlineMissing') }]} />
          <Select value={debtCustomerId} onChange={onDebtCustomerChange} allowClear showSearch optionFilterProp="searchLabel" placeholder={t('analytics.filterTopDebtors')} className="analytics-debt-filters__customer u-w-full"  options={topDebtorOptions} />
          <Select<SaleType> value={debtSaleType} onChange={onDebtSaleTypeChange} allowClear placeholder={t('sales.filterAllTypes')} className="u-w-full" options={[{ value: 'RETAIL', label: t('sales.typeRetail') }, { value: 'WHOLESALE', label: t('sales.typeWholesale') }]} />
          <Select<DebtSort> value={debtSort} onChange={onDebtSortChange} className="u-w-full" options={[{ value: 'dueDateAsc', label: t('analytics.sortDueDateAsc') }, { value: 'debtDesc', label: t('analytics.sortDebtDesc') }, { value: 'lateDesc', label: t('analytics.sortLateDesc') }, { value: 'createdDesc', label: t('analytics.sortCreatedDesc') }]} />
        </div>
        <Table<SaleListItem>
          size="small"
          rowKey="id"
          loading={debtLoading || debtFetching}
          dataSource={debtRows}
          scroll={{ x: 980 }}
          locale={{ emptyText }}
          pagination={false}
          columns={createDebtColumns(t, 1, debtRows.length)}
        />
      </div>
    </div>
  )
}
