import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Badge, Button, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, EyeIcon } from '@phosphor-icons/react'
import { SALE_TYPE_LABELS } from '@erp/erp-shared/core'
import { formatDate } from '@erp/erp-shared/lib/formatters'
import { DataTable, type ColumnDef } from '@erp/erp-shared/ui/data-table'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { SaleListItem, SaleType } from '@erp/store-buddy-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { SaleDetailDrawer } from '../detail/SaleDetailDrawer'
import { NewSaleForm } from '../form/NewSaleForm'
import { useSalesPage } from '../hooks/useSales'

type SalesFiltersForm = {
  saleType?: SaleType
  hasDebt?: string
}

interface SalesListProps {
  t: (key: string) => string
  isSuper: boolean
  userBranchId?: string | null
  exchangeRate: number
}

export function SalesList({ t, isSuper, userBranchId, exchangeRate }: SalesListProps) {
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

  const { data: result, isLoading, isFetching, refetch } = useSalesPage(page, pageSize, {
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

  const columns: ColumnDef<SaleListItem>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: SaleListItem, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 120,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(value)}</span>,
    },
    {
      title: t('nav.customers'),
      key: 'customer',
      render: (_: unknown, sale: SaleListItem) =>
        sale.customer ? (
          <div>
            <div style={{ fontWeight: 600 }}>{sale.customer.fullName}</div>
            {sale.customer.phone ? (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{sale.customer.phone}</div>
            ) : null}
          </div>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>{t('sales.anonymous')}</span>
        ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <StatusBadge tone="muted">{sale.branch.name}</StatusBadge>,
    },
    {
      title: t('sales.colType'),
      dataIndex: 'saleType',
      width: 100,
      responsiveHide: true,
      render: (value: SaleType) => <StatusBadge tone={value === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[value]}</StatusBadge>,
    },
    {
      title: t('nav.products'),
      key: 'count',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {sale._count.items} {t('common.countSuffix')}
        </span>
      ),
    },
    {
      title: t('common.total'),
      key: 'total',
      width: 150,
      align: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num" style={{ fontWeight: 700 }}>
          <MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('sales.colPaid'),
      key: 'paid',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num">
          <MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 110,
      align: 'center',
      render: (_: unknown, sale: SaleListItem) =>
        sale.debtAmountUzs > 0 ? (
          <StatusBadge tone="danger" dot>
            {t('sales.hasDebt')}
          </StatusBadge>
        ) : (
          <StatusBadge tone="success" dot>
            {t('sales.fullyPaid')}
          </StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <Tooltip title={t('common.view')}>
          <Button
            size="small"
            type="text"
            aria-label={t('common.view')}
            icon={<EyeIcon size={18} />}
            onClick={(event) => {
              //
              event.stopPropagation()
              setDrawerSale(sale)
            }}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.sales')}</h1>
          <div className="sub">{t('sales.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type={tab === 'new' ? 'primary' : 'default'} onClick={() => setTab('new')}>
            + {t('dashboard.newSale')}
          </Button>
          <Badge count={totalWithDebt} offset={[-6, 4]}>
            <Button type={tab === 'history' ? 'primary' : 'default'} onClick={() => setTab('history')}>
              {t('sales.historyBtn')} ({total})
            </Button>
          </Badge>
        </div>
      </div>

      {tab === 'new' ? (
        <NewSaleForm t={t} isSuper={isSuper} userBranchId={userBranchId} exchangeRate={exchangeRate} />
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
