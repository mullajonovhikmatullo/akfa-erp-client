import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tag, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import dayjs, { type Dayjs } from 'dayjs'
import type { ReactNode } from 'react'
import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { BranchName } from '@store/store-shared/ui/branch-name'
import { DataTable, type ColumnDef } from '@store/store-shared/ui/data-table'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { StockBatch, StockReceipt } from '@store/store-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { StockInModal } from '../../inventory/stock-in/StockInModal'
import { useStockBatchSummary, useStockReceiptItems, useStockReceiptsPage } from '../../inventory/hooks/useInventory'
import { usePagination } from '../../shared/hooks/usePagination'

type PurchaseFiltersForm = {
  branchId?: string
  dateRange: [Dayjs | null, Dayjs | null]
}

interface PurchasesListProps {
  t: (key: string) => string
  isStoreOwner: boolean
  userBranchId?: string | null
  activeBranchId?: string
  exchangeRate: number
}

export function PurchasesList({ t, isStoreOwner, userBranchId, activeBranchId, exchangeRate }: PurchasesListProps) {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch, setValue } = useForm<PurchaseFiltersForm>({
    defaultValues: { branchId: undefined, dateRange: [null, null] },
  })
  const filters = watch()
  const [creating, setCreating] = useState(false)
  const dateRange = filters.dateRange
  const headerBranchId = isStoreOwner && activeBranchId && activeBranchId !== '__all__' ? activeBranchId : undefined
  const scopedBranchId = isStoreOwner ? (headerBranchId ?? filters.branchId) : (userBranchId ?? undefined)

  useEffect(() => {
    setValue('branchId', undefined)
    onPageChange(1, pageSize)
  }, [activeBranchId])

  const receiptsQuery = useStockReceiptsPage({
    page,
    pageSize,
    branchId: scopedBranchId,
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  })
  const { data: summary } = useStockBatchSummary({ branchId: scopedBranchId })
  const { data: branches = [] } = useBranches()
  const receipts = receiptsQuery.data?.items ?? []
  const total = receiptsQuery.data?.total ?? 0
  const branchNameById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches])

  function supplierNote(note: string | null) {
    return note ? (branchNameById.get(note) ?? note) : null
  }

  const receiptColumns: ColumnDef<StockReceipt>[] = [
    {
      title: '#',
      key: '_idx',
      width: 42,
      render: (_value, _receipt, index) => <span className="purchase-row-index">{rowIndex(index)}</span>,
    },
    {
      title: t('purchases.receivedAt'),
      dataIndex: 'receivedAt',
      width: 160,
      render: (value: string) => <span className="purchase-date">{formatDateTime(value)}</span>,
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 160,
      render: (_value, receipt) => <BranchName name={receipt.branch.name} as="badge" tone="info" />,
    },
    {
      title: t('purchases.productTypes'),
      dataIndex: 'productCount',
      width: 130,
      align: 'right',
      render: (count: number) => <strong className="num">{count}</strong>,
    },
    {
      title: t('purchases.totalQuantity'),
      key: 'quantity',
      width: 190,
      render: (_value, receipt) => (
        <div className="purchase-quantity-tags">
          {receipt.pieceQuantity > 0 ? <Tag color="blue">{receipt.pieceQuantity.toLocaleString('ru-RU')} {t('units.PIECE')}</Tag> : null}
          {receipt.kgQuantity > 0 ? <Tag color="cyan">{receipt.kgQuantity.toLocaleString('ru-RU')} {t('units.KG')}</Tag> : null}
          {receipt.pieceQuantity === 0 && receipt.kgQuantity === 0 ? '—' : null}
        </div>
      ),
    },
    {
      title: t('purchases.colTotalCost'),
      dataIndex: 'totalCostUzs',
      width: 170,
      align: 'right',
      render: (amount: number) => <strong className="num"><MoneyDisplay amount={amount} currency="UZS" /></strong>,
    },
    {
      title: t('purchases.colSupplierNote'),
      dataIndex: 'supplierNote',
      responsiveHide: true,
      render: (value: string | null) => {
        const note = supplierNote(value)
        return note ? <EllipsisText maxWidth={190}>{note}</EllipsisText> : <span className="purchase-empty-value">—</span>
      },
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 150,
      responsiveHide: true,
      render: (_value, receipt) => <span className="purchase-created-by">{receipt.createdBy.fullName}</span>,
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.purchases')}</h1>
          <div className="sub">{t('purchases.receiptsSubtitle')}</div>
        </div>
        <div className="purchase-page-actions">
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={receiptsQuery.isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => void receiptsQuery.refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={() => setCreating(true)}>
            {t('purchases.newPurchase')}
          </Button>
        </div>
      </div>

      <div className="purchase-kpi-grid">
        <KpiBox label={t('purchases.kpiReceipts')} value={total} hint={t('purchases.kpiReceiptsHint')} />
        <KpiBox label={t('purchases.kpiProductLines')} value={summary?.totalBatches ?? 0} hint={t('purchases.kpiProductLinesHint')} />
        <KpiBox label={t('purchases.kpiValue')} value={<MoneyDisplay amount={summary?.totalCostUzs ?? 0} currency="UZS" />} hint={t('purchases.kpiValueHint')} />
        <KpiBox label={t('purchases.kpiRemainingValue')} value={<MoneyDisplay amount={summary?.totalRemainingValueUzs ?? 0} currency="UZS" />} hint={t('purchases.kpiRemainingValueHint')} tone="success" />
      </div>

      <div className="card purchase-receipts-card">
        <div className="purchase-filters">
          {isStoreOwner && !headerBranchId ? (
            <Controller
              name="branchId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  placeholder={t('header.allBranches')}
                  options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
                  onChange={(value) => { field.onChange(value); onPageChange(1, pageSize) }}
                />
              )}
            />
          ) : null}
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(values) => { field.onChange(values ?? [null, null]); onPageChange(1, pageSize) }}
                allowClear
                format="DD.MM.YYYY"
                placeholder={[t('common.startDate'), t('common.endDate')]}
                presets={[
                  { label: t('common.today'), value: [dayjs(), dayjs()] },
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
                ]}
              />
            )}
          />
          <span className="purchase-results"><strong>{total}</strong> {t('purchases.receiptsCount')}</span>
        </div>

        <DataTable<StockReceipt>
          rowKey="id"
          dataSource={receipts}
          columns={receiptColumns}
          loading={receiptsQuery.isLoading}
          expandable={{
            expandRowByClick: true,
            expandedRowRender: (receipt) => <ReceiptItemsFolder receipt={receipt} t={t} />,
            rowExpandable: (receipt) => receipt.productCount > 0,
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (count) => `${count} ${t('purchases.receiptsCount')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          emptyText={t('purchases.emptyReceipts')}
        />
      </div>

      <StockInModal t={t} isStoreOwner={isStoreOwner} userBranchId={scopedBranchId} exchangeRate={exchangeRate} open={creating} onClose={() => setCreating(false)} />
    </>
  )
}

function ReceiptItemsFolder({ receipt, t }: { receipt: StockReceipt; t: (key: string) => string }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const query = useStockReceiptItems(receipt.id, page, pageSize)
  const columns: ColumnDef<StockBatch>[] = [
    {
      title: '#',
      key: '_idx',
      width: 44,
      render: (_value, _batch, index) => <span className="purchase-row-index">{(page - 1) * pageSize + index + 1}</span>,
    },
    {
      title: t('nav.products'),
      key: 'product',
      render: (_value, batch) => (
        <div className="purchase-product-cell"><strong>{batch.product.name}</strong><small>{batch.product.sku || '—'}</small></div>
      ),
    },
    {
      title: t('purchases.colQty'),
      dataIndex: 'initialQty',
      width: 130,
      align: 'right',
      render: (quantity: number, batch) => <strong className="num">{quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[batch.product.unit]}</strong>,
    },
    {
      title: t('purchases.colRemaining'),
      dataIndex: 'remainingQty',
      width: 140,
      align: 'right',
      render: (quantity: number, batch) => (
        <strong className="num" style={{ color: quantity > 0 ? 'var(--success)' : 'var(--ink-4)' }}>
          {quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[batch.product.unit]}
        </strong>
      ),
    },
    {
      title: t('purchases.colCost'),
      dataIndex: 'costPriceUzs',
      width: 155,
      align: 'right',
      render: (amount: number) => <MoneyDisplay amount={amount} currency="UZS" />,
    },
    {
      title: t('purchases.colTotalCost'),
      key: 'total',
      width: 170,
      align: 'right',
      render: (_value, batch) => <strong><MoneyDisplay amount={batch.initialQty * batch.costPriceUzs} currency="UZS" /></strong>,
    },
  ]

  return (
    <div className="purchase-folder-content" onClick={(event) => event.stopPropagation()}>
      <div className="purchase-folder-title">
        <div><strong>{t('purchases.receiptDetails')}</strong><span>{receipt.productCount} {t('purchases.productTypes').toLocaleLowerCase()}</span></div>
        <Tag color="blue">{formatDateTime(receipt.receivedAt)}</Tag>
      </div>
      <DataTable<StockBatch>
        rowKey="id"
        dataSource={query.data?.items ?? []}
        columns={columns}
        loading={query.isLoading}
        pagination={{
          current: page,
          pageSize,
          total: query.data?.total ?? 0,
          showSizeChanger: true,
          hideOnSinglePage: (query.data?.total ?? 0) <= pageSize,
          pageSizeOptions: ['25', '50', '100'],
          onChange: (nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize) },
        }}
        emptyText={t('purchases.empty')}
      />
    </div>
  )
}

function KpiBox({ label, value, hint, tone = 'muted' }: { label: string; value: ReactNode; hint: string; tone?: 'success' | 'muted' }) {
  return (
    <div className="card purchase-kpi">
      <div className="purchase-kpi__label">{label}</div>
      <div className="num purchase-kpi__value" style={{ color: tone === 'success' ? 'var(--success)' : 'var(--ink-1)' }}>{value}</div>
      <div className="purchase-kpi__hint">{hint}</div>
    </div>
  )
}
