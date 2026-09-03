import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Badge, Button, Select, Tooltip } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { SaleListItem, SaleType } from '@store/store-stub'
import { SaleDetailDrawer } from '../detail/SaleDetailDrawer'
import { NewSaleForm } from '../form/NewSaleForm'
import { useSalesPage } from '../hooks/useSalesPage'
import { createSalesColumns } from './view/salesColumns'

type SalesFiltersForm = {
  saleType?: SaleType
  hasDebt?: string
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
  const { control, watch } = useForm<SalesFiltersForm>({
    defaultValues: {
      saleType: undefined,
      hasDebt: undefined,
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
          <i className="icons-plus icon-size-14" />
          {t('dashboard.newSale')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          className={tab === 'history' ? 'is-active' : undefined}
          onClick={() => setTab('history')}
        >
          <Badge count={totalWithDebt} size="small" offset={[8, 0]}>
            <span>{t('sales.historyBtn')} ({total})</span>
          </Badge>
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
            <Tooltip title={t('common.refresh')}>
              <Button icon={<i className={['icons-reload icon-size-18', isFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />} onClick={() => refetch()} />
            </Tooltip>
            <span className="u-text-muted u-fs-12-5 u-ml-auto">
              <strong>{total}</strong> {t('common.resultsSuffix')}
            </span>
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
