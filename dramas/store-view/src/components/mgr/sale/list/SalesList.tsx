import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Badge, Button, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { SaleListItem, SaleType } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { SaleDetailDrawer } from '../detail/SaleDetailDrawer'
import { NewSaleForm } from '../form/NewSaleForm'
import { useSalesPage } from '../hooks/useSalesPage'
import { createSalesColumns } from './view/salesColumns'

type SalesFiltersForm = {
  saleType?: SaleType
  hasDebt?: string
}

interface SalesListProps {
  t: (key: string) => string
  isStoreOwner: boolean
  userBranchId?: string | null
  branchId?: string
  exchangeRate: number
}

export function SalesList({ t, isStoreOwner, userBranchId, branchId, exchangeRate }: SalesListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
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

  useEffect(() => {
    onPageChange(1, pageSize)
  }, [branchId, onPageChange, pageSize])

  const { data: result, isLoading, isFetching, refetch } = useSalesPage(page, pageSize, {
    branchId,
    saleType: filters.saleType,
    hasDebt: hasDebtFilter,
  })
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
          <PlusIcon size={14} weight="bold" />
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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
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
                    onPageChange(1, pageSize)
                  }}
                  allowClear
                  placeholder={t('sales.filterAllTypes')}
                  style={{ minWidth: 160 }}
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
                    onPageChange(1, pageSize)
                  }}
                  allowClear
                  placeholder={t('sales.filterPayment')}
                  style={{ minWidth: 160 }}
                  options={[
                    { value: 'true', label: t('sales.hasDebt') },
                    { value: 'false', label: t('sales.filterPaid') },
                  ]}
                />
              )}
            />
            <Tooltip title={t('common.refresh')}>
              <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
            </Tooltip>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
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
              style: { cursor: 'pointer' },
            })}
            emptyText={t('sales.empty')}
          />
        </div>
      )}

      <SaleDetailDrawer t={t} sale={drawerSale} onClose={() => setDrawerSale(null)} />
    </>
  )
}
