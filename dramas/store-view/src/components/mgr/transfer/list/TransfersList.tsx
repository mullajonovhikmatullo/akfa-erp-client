import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, Modal, Select, Table, Tooltip } from 'antd'
import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
} from '@phosphor-icons/react'
import { DataTable } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Transfer, TransferStatus } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { NewTransferModal } from '../form/NewTransferModal'
import { useTransferMutation } from '../hooks/useTransferMutation'
import { useTransfersList } from '../hooks/useTransfersList'
import { InfoRow } from './view/InfoRow'
import { ExpandedTransferRow, createTransferColumns, createTransferConfirmColumns } from './view/transferColumns'

type TransferFiltersForm = {
  status?: TransferStatus
}

interface TransfersListProps {
  t: (key: string) => string
  isStoreOwner: boolean
  userBranchId?: string | null
  branchId?: string
  userId?: string | null
  exchangeRate: number
}

export function TransfersList({ t, isStoreOwner, userBranchId, branchId, userId, exchangeRate }: TransfersListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<TransferFiltersForm>({
    defaultValues: { status: undefined },
  })
  const filters = watch()
  const [creating, setCreating] = useState(false)
  const [confirmingTransfer, setConfirmingTransfer] = useState<Transfer | null>(null)

  const { data: transfers = [], isLoading, isFetching, refetch } = useTransfersList({
    branchId,
    status: filters.status,
    limit: 100,
  })

  const { completeTransfer, cancelTransfer } = useTransferMutation(t)

  const pendingCount = transfers.filter((transfer) => transfer.status === 'PENDING').length
  const confirmingTotal = confirmingTransfer?.items.reduce((sum, item) => sum + item.totalCostUzs, 0) ?? 0

  const statusOptions: { value: TransferStatus; label: string }[] = [
    { value: 'PENDING', label: t('transfers.statusPendingLabel') },
    { value: 'COMPLETED', label: t('transfers.statusCompleted') },
    { value: 'CANCELLED', label: t('transfers.statusCancelled') },
  ]

  const statusLabel: Record<TransferStatus, string> = {
    PENDING: t('transfers.statusPendingLabel'),
    COMPLETED: t('transfers.statusCompleted'),
    CANCELLED: t('transfers.statusCancelled'),
  }

  const columns = createTransferColumns({
    t,
    rowIndex,
    statusLabel,
    isStoreOwner,
    userBranchId,
    userId,
    cancelPending: cancelTransfer.isPending,
    onComplete: setConfirmingTransfer,
    onCancel: (id) => cancelTransfer.mutate(id),
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.transfers')}</h1>
          <div className="sub">
            {transfers.length} {t('transfers.subtitleSuffix')} · {pendingCount} {t('transfers.statusPending')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<ArrowsLeftRightIcon size={13} weight="bold" />} onClick={() => setCreating(true)}>
            {t('transfers.newTransfer')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
          </Tooltip>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                allowClear
                placeholder={t('transfers.filterAll')}
                style={{ minWidth: 180 }}
                options={statusOptions}
              />
            )}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{transfers.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Transfer>
          rowKey="id"
          dataSource={transfers}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          expandable={{
            expandedRowRender: (transfer) => <ExpandedTransferRow transfer={transfer} t={t} />,
            rowExpandable: () => true,
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
      <Modal
        open={Boolean(confirmingTransfer)}
        width={760}
        title={t('transfers.confirmReceiptTitle')}
        okText={t('transfers.confirmReceiptOk')}
        cancelText={t('transfers.confirmReceiptCancel')}
        okButtonProps={{ loading: completeTransfer.isPending }}
        onCancel={() => setConfirmingTransfer(null)}
        onOk={() => {
          //
          if (!confirmingTransfer) return
          completeTransfer.mutate(confirmingTransfer.id, {
            onSuccess: () => setConfirmingTransfer(null),
          })
        }}
      >
        {confirmingTransfer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert type="warning" showIcon message={t('transfers.confirmReceiptWarning')} description={t('transfers.confirmReceiptDesc')} />
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <InfoRow label={t('transfers.confirmReceiptRoute')} value={`${confirmingTransfer.fromBranch.name} → ${confirmingTransfer.toBranch.name}`} />
              <InfoRow label={t('transfers.confirmReceiptItems')} value={`${confirmingTransfer.items.length} ${t('transfers.itemTypeSuffix')}`} />
              <InfoRow label={t('transfers.colTotal')} value={<MoneyDisplay amount={confirmingTotal} currency="UZS" />} />
            </div>
            <Table<Transfer['items'][number]>
              size="small"
              pagination={false}
              scroll={{ x: 650 }}
              rowKey="id"
              dataSource={confirmingTransfer.items}
              columns={createTransferConfirmColumns(t)}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}
