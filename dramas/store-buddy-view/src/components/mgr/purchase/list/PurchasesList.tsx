import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import dayjs, { type Dayjs } from 'dayjs'
import type { ReactNode } from 'react'
import { PRODUCT_UNIT_LABELS } from '@erp/erp-shared/core'
import { formatDateTime } from '@erp/erp-shared/lib/formatters'
import { BranchName } from '@erp/erp-shared/ui/branch-name'
import { DataTable, type ColumnDef } from '@erp/erp-shared/ui/data-table'
import { EllipsisText } from '@erp/erp-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import type { StockBatch } from '@erp/store-buddy-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { StockInModal } from '../../inventory/stock-in/StockInModal'
import { useStockBatchSummary, useStockBatchesPage } from '../../inventory/hooks/useInventory'
import { usePagination } from '../../shared/hooks/usePagination'

type PurchaseFiltersForm = {
  depleted?: string
  dateRange: [Dayjs | null, Dayjs | null]
}

interface PurchasesListProps {
  t: (key: string) => string
  isSuper: boolean
  userBranchId?: string | null
  exchangeRate: number
}

export function PurchasesList({ t, isSuper, userBranchId, exchangeRate }: PurchasesListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<PurchaseFiltersForm>({
    defaultValues: {
      depleted: undefined,
      dateRange: [null, null],
    },
  })
  const filters = watch()
  const [creating, setCreating] = useState(false)
  const depletedFilter = filters.depleted === undefined ? undefined : filters.depleted === 'true'
  const dateRange = filters.dateRange
  const dateFilters = {
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  }

  const { data: result, isLoading, isFetching, refetch } = useStockBatchesPage(page, pageSize, {
    depleted: depletedFilter,
    ...dateFilters,
  })
  const { data: summary } = useStockBatchSummary()
  const { data: branches = [] } = useBranches()
  const batches = result?.items ?? []
  const total = result?.total ?? 0
  const totalBatches = summary?.totalBatches ?? 0
  const activeBatches = summary?.totalActive ?? 0
  const totalCost = summary?.totalCostUzs ?? 0
  const totalRemainingValue = summary?.totalRemainingValueUzs ?? 0
  const branchNameById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches])

  function getSupplierNote(note: string | null) {
    //
    if (!note) return null
    return branchNameById.get(note) ?? note
  }

  const columns: ColumnDef<StockBatch>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: StockBatch, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'receivedAt',
      width: 120,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDateTime(value)}</span>,
    },
    {
      title: t('nav.products'),
      key: 'product',
      render: (_: unknown, batch: StockBatch) => (
        <div>
          <div style={{ fontWeight: 600 }}>{batch.product.name}</div>
          {batch.product.sku ? (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{batch.product.sku}</div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, batch: StockBatch) => <BranchName name={batch.branch.name} as="badge" tone="info" />,
    },
    {
      title: t('purchases.colQty'),
      key: 'qty',
      width: 120,
      align: 'right',
      render: (_: unknown, batch: StockBatch) => {
        //
        const unit = PRODUCT_UNIT_LABELS[batch.product.unit]
        return (
          <span className="num" style={{ fontWeight: 600 }}>
            {batch.initialQty.toLocaleString('ru-RU')} {unit}
          </span>
        )
      },
    },
    {
      title: t('purchases.colRemaining'),
      key: 'remainingQty',
      width: 130,
      align: 'right',
      render: (_: unknown, batch: StockBatch) => {
        //
        const unit = PRODUCT_UNIT_LABELS[batch.product.unit]
        const depleted = batch.remainingQty === 0
        return (
          <span className="num" style={{ fontWeight: 700, color: depleted ? 'var(--ink-4)' : 'var(--success)' }}>
            {batch.remainingQty.toLocaleString('ru-RU')} {unit}
          </span>
        )
      },
    },
    {
      title: t('purchases.colCost'),
      key: 'cost',
      width: 150,
      align: 'right',
      render: (_: unknown, batch: StockBatch) => (
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={batch.costPriceUzs} currency="UZS" />
          </div>
          {batch.costPriceUsd != null ? (
            <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              <MoneyDisplay amount={batch.costPriceUsd} currency="USD" />
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('purchases.colTotalCost'),
      key: 'totalCost',
      width: 160,
      responsiveHide: true,
      align: 'right',
      render: (_: unknown, batch: StockBatch) => (
        <span className="num" style={{ fontWeight: 600 }}>
          <MoneyDisplay amount={batch.initialQty * batch.costPriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('purchases.colSupplierNote'),
      dataIndex: 'supplierNote',
      responsiveHide: true,
      render: (value: string | null) => {
        //
        const note = getSupplierNote(value)
        return note ? (
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
            <EllipsisText maxWidth={180}>{note}</EllipsisText>
          </span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>-</span>
        )
      },
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, batch: StockBatch) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{batch.createdBy.fullName}</span>,
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.purchases')}</h1>
          <div className="sub">
            {totalBatches} {t('purchases.subtitleBatches')} · {activeBatches} {t('purchases.subtitleActive')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={() => setCreating(true)}>
            {t('purchases.newPurchase')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
        <KpiBox label={t('purchases.kpiTotal')} value={totalBatches} hint={t('purchases.kpiTotalHint')} />
        <KpiBox label={t('purchases.kpiActive')} value={activeBatches} hint={t('purchases.kpiActiveHint')} tone="success" />
        <KpiBox label={t('purchases.kpiValue')} value={<MoneyDisplay amount={totalCost} currency="UZS" />} hint={t('purchases.kpiValueHint')} />
        <KpiBox
          label={t('purchases.kpiRemainingValue')}
          value={<MoneyDisplay amount={totalRemainingValue} currency="UZS" />}
          hint={t('purchases.kpiRemainingValueHint')}
          tone="success"
        />
      </div>

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
            name="depleted"
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
                placeholder={t('purchases.filterAll')}
                style={{ minWidth: 180 }}
                options={[
                  { value: 'false', label: t('purchases.filterActive') },
                  { value: 'true', label: t('purchases.depleted') },
                ]}
              />
            )}
          />
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(values) => {
                  //
                  field.onChange(values ?? [null, null])
                  onPageChange(1, pageSize)
                }}
                allowClear
                format="YYYY-MM-DD"
                placeholder={[t('common.startDate'), t('common.endDate')]}
                presets={[
                  { label: t('common.today'), value: [dayjs(), dayjs()] },
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
                ]}
                style={{ minWidth: 260 }}
              />
            )}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{total}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<StockBatch>
          rowKey="id"
          dataSource={batches}
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
          emptyText={t('purchases.empty')}
        />
      </div>

      <StockInModal t={t} isSuper={isSuper} userBranchId={userBranchId} exchangeRate={exchangeRate} open={creating} onClose={() => setCreating(false)} />
    </>
  )
}

function KpiBox({
  label,
  value,
  hint,
  tone = 'muted',
}: {
  label: string
  value: ReactNode
  hint: string
  tone?: 'success' | 'muted'
}) {
  //
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: tone === 'success' ? 'var(--success)' : 'var(--ink-1)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
    </div>
  )
}
