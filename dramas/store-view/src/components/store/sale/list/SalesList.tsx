import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'

import dayjs from 'dayjs'
import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { SaleListItem, SaleType } from '@store/store-stub'
import { SaleDetailDrawer } from '../detail/SaleDetailDrawer'
import { NewSaleForm } from '../form/NewSaleForm'
import { useSalesPage } from '../hooks/useSalesPage'
import { useSalesRangeReport } from '../hooks/useSalesRangeReport'
import { useSalesRangeReportPrint } from '../hooks/useSalesRangeReportPrint'
import { SalesReportSummary } from './view/SalesReportSummary'
import { createSalesColumns } from './view/salesColumns'
import {
  createSalesPeriodPresets,
  formatSalesPeriod,
  SALES_REPORT_LIST_MAX_DAYS,
  salesPeriodBounds,
  salesPeriodDays,
  type SalesPeriod,
} from './view/salesPeriods'

type SalesFiltersForm = {
  saleType?: SaleType
  hasDebt?: string
  period: SalesPeriod | null
}

const REPORT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

interface SalesListProps {
  isStoreOwner: boolean
  userBranchId?: string | null
  branchId?: string
  exchangeRate: number
}

export function SalesList({ isStoreOwner, userBranchId, branchId, exchangeRate }: SalesListProps) {
  //
  const t = useStoreT()
  const { control, watch, setValue } = useForm<SalesFiltersForm>({
    defaultValues: {
      saleType: undefined,
      hasDebt: undefined,
      period: null,
    },
  })
  const filters = watch()
  const [tab, setTab] = useState<'new' | 'history'>('new')
  const [drawerSale, setDrawerSale] = useState<SaleListItem | null>(null)
  const hasDebtFilter = filters.hasDebt === undefined ? undefined : filters.hasDebt === 'true'
  const periodBounds = filters.period ? salesPeriodBounds(filters.period) : null

  const { data: result, isLoading, isFetching, refetch, page, pageSize, onPageChange, resetPage, rowIndex } = useSalesPage({
    branchId,
    saleType: filters.saleType,
    hasDebt: hasDebtFilter,
    from: periodBounds?.from,
    to: periodBounds?.to,
  })
  const reportQuery = periodBounds
    ? { branchId, saleType: filters.saleType, hasDebt: hasDebtFilter, ...periodBounds, tz: REPORT_TIME_ZONE }
    : null
  const { data: report, refetch: refetchReport } = useSalesRangeReport(reportQuery ? { ...reportQuery, includeSales: false } : null)
  const { print, isPrinting } = useSalesRangeReportPrint(t)

  useEffect(() => {
    //
    resetPage()
  }, [branchId, resetPage])

  const sales = result?.items ?? []
  const total = result?.total ?? 0
  const totalWithDebt = result?.totalWithDebt ?? 0

  const saleTypeOptions: { value: SaleType; label: string }[] = [
    { value: 'RETAIL', label: t('sales.typeRetail') },
    { value: 'WHOLESALE', label: t('sales.typeWholesale') },
  ]

  function handlePrint() {
    //
    if (!filters.period || !reportQuery) return
    const hasDebtLabel = filters.hasDebt === 'true' ? t('sales.hasDebt') : filters.hasDebt === 'false' ? t('sales.filterPaid') : null
    void print(
      { ...reportQuery, includeSales: salesPeriodDays(filters.period) <= SALES_REPORT_LIST_MAX_DAYS },
      formatSalesPeriod(filters.period),
      [
        saleTypeOptions.find((option) => option.value === filters.saleType)?.label ?? t('sales.filterAllTypes'),
        ...(hasDebtLabel ? [hasDebtLabel] : []),
      ],
    )
  }

  const columns = createSalesColumns({
    t,
    rowIndex,
    onView: (sale) => setDrawerSale(sale),
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.sales')}</h1>
          <div className="sub">{t('sales.subtitle')}</div>
        </div>
      </div>

      <div className="sales-tabs" role="tablist" aria-label={t('nav.sales')}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'new'}
          className={tab === 'new' ? 'is-active' : undefined}
          onClick={() => setTab('new')}
        >
          <PlusIcon size={14} weight="regular" aria-hidden="true" />
          {t('dashboard.newSale')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          className={tab === 'history' ? 'is-active' : undefined}
          onClick={() => setTab('history')}
        >
          {t('sales.historyBtn')}
        </button>
      </div>

      {tab === 'new' ? (
        <NewSaleForm t={t} isStoreOwner={isStoreOwner} userBranchId={userBranchId} exchangeRate={exchangeRate} />
      ) : (
        <div className="card u-overflow-hidden u-p-0" >
          <div
            className="u-items-center u-border-b-default u-flex u-flex-wrap u-gap-10 u-p-14-16"
          >
            <Controller
              name="saleType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(value) => {
                    //
                    field.onChange(value)
                    resetPage()
                  }}
                  allowClear
                  placeholder={t('sales.filterAllTypes')}
                  className="u-min-w-160"
                  options={saleTypeOptions}
                />
              )}
            />
            <Controller
              name="hasDebt"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(value) => {
                    //
                    field.onChange(value)
                    resetPage()
                  }}
                  allowClear
                  placeholder={t('sales.filterPayment')}
                  className="u-min-w-160"
                  options={[
                    { value: 'true', label: t('sales.hasDebt') },
                    { value: 'false', label: t('sales.filterPaid') },
                  ]}
                />
              )}
            />
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <DatePicker.RangePicker
                  value={field.value}
                  onChange={(value) => {
                    //
                    field.onChange(value?.[0] && value[1] ? [value[0], value[1]] : null)
                    resetPage()
                  }}
                  format="DD.MM.YYYY"
                  placeholder={[t('common.startDate'), t('common.endDate')]}
                  disabledDate={(date) => date.isAfter(dayjs(), 'day')}
                  presets={createSalesPeriodPresets(t)}
                />
              )}
            />
            <Tooltip title={t('common.refresh')}>
              <Button
                icon={<StoreIcon name="reload" size={16} className={isFetching ? 'ph-icon-spin' : undefined} />}
                onClick={() => {
                  //
                  void refetch()
                  if (reportQuery) void refetchReport()
                }}
              />
            </Tooltip>
            <Tooltip title={filters.period ? t('sales.printTooltip') : t('sales.printNeedsPeriod')}>
              <Button icon={<StoreIcon name="printer" size={16} />} disabled={!filters.period || total === 0} loading={isPrinting} onClick={handlePrint}>
                {t('sales.print')}
              </Button>
            </Tooltip>
            <div className="sales-history-stats">
              {totalWithDebt > 0 && filters.hasDebt !== 'true' ? (
                <button
                  type="button"
                  className="sales-history-stats__debt"
                  onClick={() => {
                    //
                    setValue('hasDebt', 'true')
                    resetPage()
                  }}
                >
                  <StatusBadge tone="danger" dot>
                    {t('sales.hasDebt')}: <span className="num">{totalWithDebt.toLocaleString('ru-RU')}</span>
                  </StatusBadge>
                </button>
              ) : null}
              <span className="u-text-muted u-fs-12-5">
                <strong className="num">{total.toLocaleString('ru-RU')}</strong> {t('common.resultsSuffix')}
              </span>
            </div>
          </div>

          {filters.period && report ? <SalesReportSummary t={t} summary={report.summary} /> : null}

          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={sales}
            columns={columns}
            loading={isLoading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: onPageChange,
              showSizeChanger: true,
              showTotal: (count) => `${count} ${t('common.countSuffix')}`,
              pageSizeOptions: ['10', '25', '50'],
            }}
            onRow={(sale) => ({
              onClick: () => setDrawerSale(sale),
              className: 'clickable-row',
            })}
            emptyText={t('sales.empty')}
          />
        </div>
      )}

      <SaleDetailDrawer t={t} sale={drawerSale} onClose={() => setDrawerSale(null)} />
    </>
  )
}
