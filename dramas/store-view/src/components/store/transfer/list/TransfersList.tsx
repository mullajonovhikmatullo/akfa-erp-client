import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Select, Tooltip } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { TransferStatus, TransferSummary } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { NewTransferModal } from '../form/NewTransferModal'
import { useTransfersPage } from '../hooks/useTransfersPage'
import { createTransferColumns, transferStatusLabel } from './view/transferColumns'

interface TransfersListProps {
  isStoreOwner: boolean
  userBranchId?: string | null
  branchId?: string
  exchangeRate: number
  onOpenTransfer: (transferId: string) => void
}

const STATUSES: TransferStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED']

export function TransfersList({ isStoreOwner, userBranchId, branchId, exchangeRate, onOpenTransfer }: TransfersListProps) {
  //
  const t = useStoreT()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status = STATUSES.find((value) => value === statusParam)
  const [creating, setCreating] = useState(false)
  const { page, pageSize, changePage, goToPage, resetPage, rowIndex } = usePagination()

  const transfersQuery = useTransfersPage({ branchId, status, page, pageSize })
  const transfers = transfersQuery.data?.items ?? []
  const total = transfersQuery.data?.total ?? 0
  const pendingCount = transfersQuery.data?.pendingCount ?? 0
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  const previousBranchId = useRef(branchId)
  useEffect(() => {
    //
    if (previousBranchId.current === branchId) return
    previousBranchId.current = branchId
    resetPage()
  }, [branchId, resetPage])

  useEffect(() => {
    //
    if (transfersQuery.isPlaceholderData || !transfersQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [goToPage, lastPage, page, transfersQuery.data, transfersQuery.isPlaceholderData])

  function changeStatus(value?: TransferStatus) {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current)
      if (value) next.set('status', value)
      else next.delete('status')
      next.delete('page')
      return next
    }, { replace: true })
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.transfers')}</h1>
          <div className="sub">
            {total} {t('transfers.subtitleSuffix')} · {pendingCount} {t('transfers.statusPending')}
          </div>
        </div>
        <div className="u-flex u-gap-8">
          <Button type="primary" icon={<StoreIcon name="plus" size={16} />} onClick={() => setCreating(true)}>
            {t('transfers.newTransfer')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<StoreIcon name="reload" size={16} className={transfersQuery.isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => void transfersQuery.refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <div className="card u-overflow-hidden u-p-0">
        <div className="u-items-center u-border-b-default u-flex u-gap-10 u-p-14-16">
          <Select
            value={status}
            onChange={changeStatus}
            allowClear
            placeholder={t('transfers.filterAll')}
            className="u-min-w-180"
            options={STATUSES.map((value) => ({ value, label: transferStatusLabel(t, value) }))}
          />
          <span className="u-text-muted u-fs-12-5 u-ml-auto">
            <strong>{total}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<TransferSummary>
          rowKey="id"
          dataSource={transfers}
          columns={createTransferColumns({ t, rowIndex })}
          loading={transfersQuery.isLoading}
          onRow={(transfer) => ({
            onClick: () => onOpenTransfer(transfer.id),
            className: 'clickable-row',
          })}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: changePage,
            showSizeChanger: true,
            showTotal: (count) => `${count} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          emptyText={t('transfers.empty')}
        />
      </div>

      <NewTransferModal
        t={t}
        isStoreOwner={isStoreOwner}
        userBranchId={userBranchId}
        exchangeRate={exchangeRate}
        open={creating}
        onClose={() => setCreating(false)}
      />
    </>
  )
}
