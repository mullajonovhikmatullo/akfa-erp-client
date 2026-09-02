import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import dayjs, { type Dayjs } from 'dayjs'
import { DataTable } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { StockReceipt } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { StockInModal } from '../../inventory/stock-in/StockInModal'
import { useStockBatchSummary } from '../../inventory/hooks/useStockBatchSummary'
import { useStockReceiptsPage } from '../../inventory/hooks/useStockReceiptsPage'
import { usePagination } from '../../shared/hooks/usePagination'
import { PurchaseKpiBox } from './view/PurchaseKpiBox'
import { ReceiptItemsFolder } from './view/ReceiptItemsFolder'
import { createReceiptColumns } from './view/receiptColumns'

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
  //
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
  const { data: branches = [] } = useBranchesList()
  const receipts = receiptsQuery.data?.items ?? []
  const total = receiptsQuery.data?.total ?? 0
  const branchNameById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches])

  function supplierNote(note: string | null) {
    return note ? (branchNameById.get(note) ?? note) : null
  }

  const receiptColumns = createReceiptColumns({ t, rowIndex, supplierNote })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.purchases')}</h1>
          <div className="sub">{t('purchases.receiptsSubtitle')}</div>
        </div>
        <div className="purchase-page-actions">
          <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={() => setCreating(true)}>
            {t('purchases.newPurchase')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={receiptsQuery.isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => void receiptsQuery.refetch()} />
          </Tooltip>
        </div>
      </div>

      <div className="purchase-kpi-grid">
        <PurchaseKpiBox label={t('purchases.kpiReceipts')} value={total} hint={t('purchases.kpiReceiptsHint')} />
        <PurchaseKpiBox label={t('purchases.kpiProductLines')} value={summary?.totalBatches ?? 0} hint={t('purchases.kpiProductLinesHint')} />
        <PurchaseKpiBox label={t('purchases.kpiValue')} value={<MoneyDisplay amount={summary?.totalCostUzs ?? 0} currency="UZS" />} hint={t('purchases.kpiValueHint')} />
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
