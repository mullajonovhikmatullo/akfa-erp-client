import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select } from 'antd'

import dayjs, { type Dayjs } from 'dayjs'
import { useStoreT } from '@store/store-i18n'
import type { AnalyticsPeriod, AnalyticsQuery, SaleType } from '@store/store-stub'
import { useSalesList } from '../sale/hooks/useSalesList'
import { useCustomerDebtReport } from './hooks/useCustomerDebtReport'
import { useDashboardReport } from './hooks/useDashboardReport'
import { useExpenseReport } from './hooks/useExpenseReport'
import { useInventoryReport } from './hooks/useInventoryReport'
import { useSalesReport } from './hooks/useSalesReport'
import { DashboardTab } from './view/DashboardTab'
import { DebtTab } from './view/DebtTab'
import { ExpensesTab } from './view/ExpensesTab'
import { InventoryTab } from './view/InventoryTab'
import { SalesTab } from './view/SalesTab'
import type { DebtDeadlineFilter, DebtScope, DebtSort, Tab } from './view/types'

type AnalyticsFiltersForm = {
  period: AnalyticsPeriod
  dateRange: [Dayjs | null, Dayjs | null]
}

export interface AnalyticsWorkspaceProps {
  branchId?: string
}

export function AnalyticsWorkspace({ branchId }: AnalyticsWorkspaceProps) {
  //
  const t = useStoreT()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [debtScope, setDebtScope] = useState<DebtScope>('overdue')
  const [debtDeadlineFilter, setDebtDeadlineFilter] = useState<DebtDeadlineFilter>('all')
  const [debtSort, setDebtSort] = useState<DebtSort>('dueDateAsc')
  const [debtCustomerId, setDebtCustomerId] = useState<string | undefined>()
  const [debtSaleType, setDebtSaleType] = useState<SaleType | undefined>()
  const { control, watch } = useForm<AnalyticsFiltersForm>({
    defaultValues: { period: 'day', dateRange: [dayjs().startOf('month'), dayjs()] },
  })
  const { period, dateRange } = watch()
  const query: AnalyticsQuery = { branchId, from: dateRange[0]?.toISOString(), to: dateRange[1]?.toISOString(), period, limit: 10 }
  const dashboard = useDashboardReport(query)
  const salesReport = useSalesReport(query)
  const expenseReport = useExpenseReport(query)
  const inventoryReport = useInventoryReport(query)
  const customerDebt = useCustomerDebtReport(query)
  const debtSales = useSalesList({ branchId: query.branchId, from: query.from, to: query.to, hasDebt: true, overdue: debtScope === 'overdue' ? true : undefined, customerId: debtCustomerId, saleType: debtSaleType })

  const handleDebtScopeChange = (value: DebtScope) => {
    //
    setDebtScope(value)
    if (value === 'overdue' && debtDeadlineFilter === 'withoutDeadline') setDebtDeadlineFilter('all')
  }

  const handleDebtDeadlineChange = (value: DebtDeadlineFilter) => {
    //
    setDebtDeadlineFilter(value)
    if (value === 'withoutDeadline') setDebtScope('allDebt')
  }

  const refetchAll = () => {
    //
    dashboard.refetch()
    salesReport.refetch()
    expenseReport.refetch()
    inventoryReport.refetch()
    customerDebt.refetch()
    debtSales.refetch()
  }

  const anyFetching = dashboard.isFetching || salesReport.isFetching || expenseReport.isFetching || inventoryReport.isFetching || customerDebt.isFetching || debtSales.isFetching
  const periodOptions = [
    { value: 'day' as const, label: t('analytics.periodDay') },
    { value: 'week' as const, label: t('analytics.periodWeek') },
    { value: 'month' as const, label: t('analytics.periodMonth') },
  ]
  const tabs = [
    { key: 'dashboard' as const, label: t('analytics.tabDashboard') },
    { key: 'sales' as const, label: t('analytics.tabSales') },
    { key: 'expenses' as const, label: t('analytics.tabExpenses') },
    { key: 'inventory' as const, label: t('analytics.tabInventory') },
    { key: 'debt' as const, label: t('analytics.tabDebt') },
  ]

  return (
    <>
      <div className="page-head">
        <div><h1>{t('analytics.title')}</h1><div className="sub">{t('analytics.subtitle')}</div></div>
        <div className="u-items-center u-flex u-flex-wrap u-gap-8">
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => <DatePicker.RangePicker value={field.value} onChange={(value) => field.onChange(value ? [value[0], value[1]] : [null, null])} format="DD.MM.YYYY" presets={[{ label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] }, { label: t('analytics.lastMonth'), value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] }, { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day'), dayjs()] }, { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day'), dayjs()] }]} />}
          />
          <Controller name="period" control={control} render={({ field }) => <Select value={field.value} onChange={field.onChange} options={periodOptions} className="u-w-120" />} />
          <Button icon={<i className={['icons-reload icon-size-18', anyFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />} onClick={refetchAll} />
        </div>
      </div>
      <div className="analytics-tabs" role="tablist" aria-label={t('analytics.title')}>
        {tabs.map((tabItem) => <button key={tabItem.key} type="button" role="tab" aria-selected={tab === tabItem.key} className={tab === tabItem.key ? 'is-active' : undefined} onClick={() => setTab(tabItem.key)}>{tabItem.label}</button>)}
      </div>
      {tab === 'dashboard' ? <DashboardTab data={dashboard.data} loading={dashboard.isLoading} t={t} /> : null}
      {tab === 'sales' ? <SalesTab data={salesReport.data} loading={salesReport.isLoading} t={t} /> : null}
      {tab === 'expenses' ? <ExpensesTab data={expenseReport.data} loading={expenseReport.isLoading} t={t} /> : null}
      {tab === 'inventory' ? <InventoryTab data={inventoryReport.data} loading={inventoryReport.isLoading} t={t} /> : null}
      {tab === 'debt' ? <DebtTab data={customerDebt.data} loading={customerDebt.isLoading} t={t} debtSales={debtSales.data} debtLoading={debtSales.isLoading} debtFetching={debtSales.isFetching} debtScope={debtScope} debtDeadlineFilter={debtDeadlineFilter} debtSort={debtSort} debtCustomerId={debtCustomerId} debtSaleType={debtSaleType} onDebtScopeChange={handleDebtScopeChange} onDebtDeadlineChange={handleDebtDeadlineChange} onDebtSortChange={setDebtSort} onDebtCustomerChange={setDebtCustomerId} onDebtSaleTypeChange={setDebtSaleType} /> : null}
    </>
  )
}
