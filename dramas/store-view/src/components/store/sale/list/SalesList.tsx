import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'

import dayjs, { type Dayjs } from 'dayjs'
import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { SaleListItem, SaleType } from '@store/store-stub'
import { SaleDetailDrawer } from '../detail/SaleDetailDrawer'
import { NewSaleForm } from '../form/NewSaleForm'
import { useSalesPage } from '../hooks/useSalesPage'
import { createSalesColumns } from './view/salesColumns'

type SalesFiltersForm = {
  saleType?: SaleType
  hasDebt?: string
  day: Dayjs | null
}

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
      day: null,
    },
  })
  const filters = watch()
  const [tab, setTab] = useState<'new' | 'history'>('new')
  const [drawerSale, setDrawerSale] = useState<SaleListItem | null>(null)
  const hasDebtFilter = filters.hasDebt === undefined ? undefined : filters.hasDebt === 'true'

  const { data: result, isLoading, isFetching, refetch, page, pageSize, onPageChange, resetPage, rowIndex } = useSalesPage({
    branchId,
    saleType: filters.saleType,
    hasDebt: hasDebtFilter,
    from: filters.day?.startOf('day').toISOString(),
    to: filters.day?.endOf('day').toISOString(),
  })

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
              name="day"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(value) => {
                    //
                    field.onChange(value)
                    resetPage()
                  }}
                  format="DD.MM.YYYY"
                  placeholder={t('sales.filterDay')}
                  disabledDate={(date) => date.isAfter(dayjs(), 'day')}
                  presets={[
                    { label: t('common.today'), value: dayjs() },
                    { label: t('common.yesterday'), value: dayjs().subtract(1, 'day') },
                  ]}
                  className="u-min-w-160"
                />
              )}
            />
            <Tooltip title={t('common.refresh')}>
              <Button icon={<StoreIcon name="reload" size={16} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
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
