import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, DatePicker, Select, Tooltip } from 'antd'

import dayjs, { type Dayjs } from 'dayjs'
import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { StockReceipt } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { StockInModal } from '../../inventory/stock-in/StockInModal'
import { useStockBatchSummary } from '../../inventory/hooks/useStockBatchSummary'
import { useStockReceiptsPage } from '../../inventory/hooks/useStockReceiptsPage'
import { usePagination } from '../../shared/hooks/usePagination'
import { PurchaseKpiBox } from './view/PurchaseKpiBox'
import { createReceiptColumns } from './view/receiptColumns'

type PurchaseFilterKey = 'branch' | 'from' | 'to'

const DAY_FORMAT = 'YYYY-MM-DD'

function parseDay(value: string | null) {
  //
  if (!value) return null
  const day = dayjs(value)
  return day.isValid() ? day : null
}

interface PurchasesListProps {
  isStoreOwner: boolean
  userBranchId?: string | null
  activeBranchId?: string
  exchangeRate: number
  onOpenReceipt: (receiptId: string) => void
}

export function PurchasesList({ isStoreOwner, userBranchId, activeBranchId, exchangeRate, onOpenReceipt }: PurchasesListProps) {
  //
  const t = useStoreT()
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, pageSize, changePage, goToPage, rowIndex } = usePagination()
  const [creating, setCreating] = useState(false)
  const filterBranchId = searchParams.get('branch') ?? undefined
  const dateRange: [Dayjs | null, Dayjs | null] = [parseDay(searchParams.get('from')), parseDay(searchParams.get('to'))]
  const headerBranchId = isStoreOwner && activeBranchId && activeBranchId !== '__all__' ? activeBranchId : undefined
  const scopedBranchId = isStoreOwner ? (headerBranchId ?? filterBranchId) : (userBranchId ?? undefined)

  const receiptsQuery = useStockReceiptsPage({
    branchId: scopedBranchId,
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
    page,
    pageSize,
  })
  const lastPage = Math.max(1, Math.ceil((receiptsQuery.data?.total ?? 0) / pageSize))

  const setFilters = useCallback((values: Partial<Record<PurchaseFilterKey, string | null>>) => {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current)
      Object.entries(values).forEach(([key, value]) => {
        if (value) next.set(key, value)
        else next.delete(key)
      })
      next.delete('page')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const previousActiveBranchId = useRef(activeBranchId)
  useEffect(() => {
    //
    if (previousActiveBranchId.current === activeBranchId) return
    previousActiveBranchId.current = activeBranchId
    setFilters({ branch: null })
  }, [activeBranchId, setFilters])

  useEffect(() => {
    //
    if (receiptsQuery.isPlaceholderData || !receiptsQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [goToPage, lastPage, page, receiptsQuery.data, receiptsQuery.isPlaceholderData])

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
          <Button type="primary" icon={<StoreIcon name="plus" size={16} />} onClick={() => setCreating(true)}>
            {t('purchases.newPurchase')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<StoreIcon name="reload" size={16} className={receiptsQuery.isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => void receiptsQuery.refetch()} />
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
            <Select
              value={filterBranchId}
              allowClear
              placeholder={t('header.allBranches')}
              options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
              onChange={(value) => setFilters({ branch: value ?? null })}
            />
          ) : null}
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(values) => setFilters({ from: values?.[0]?.format(DAY_FORMAT) ?? null, to: values?.[1]?.format(DAY_FORMAT) ?? null })}
            allowClear
            format="DD.MM.YYYY"
            placeholder={[t('common.startDate'), t('common.endDate')]}
            presets={[
              { label: t('common.today'), value: [dayjs(), dayjs()] },
              { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
            ]}
          />
          <span className="purchase-results"><strong>{total}</strong> {t('purchases.receiptsCount')}</span>
        </div>

        <DataTable<StockReceipt>
          rowKey="id"
          dataSource={receipts}
          columns={receiptColumns}
          loading={receiptsQuery.isLoading}
          onRow={(receipt) => ({
            onClick: () => onOpenReceipt(receipt.id),
            className: 'clickable-row',
          })}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: changePage,
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
