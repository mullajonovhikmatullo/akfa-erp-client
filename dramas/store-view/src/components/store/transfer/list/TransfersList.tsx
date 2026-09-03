import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, Modal, Select, Table, Tooltip } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Transfer, TransferStatus } from '@store/store-stub'
import { NewTransferModal } from '../form/NewTransferModal'
import { useTransferMutation } from '../hooks/useTransferMutation'
import { useTransfersList } from '../hooks/useTransfersList'
import { InfoRow } from './view/InfoRow'
import { ExpandedTransferRow, createTransferColumns, createTransferConfirmColumns } from './view/transferColumns'

type TransferFiltersForm = {
  status?: TransferStatus
}

interface TransfersListProps {
  isStoreOwner: boolean
  userBranchId?: string | null
  branchId?: string
  userId?: string | null
  exchangeRate: number
}

export function TransfersList({ isStoreOwner, userBranchId, branchId, userId, exchangeRate }: TransfersListProps) {
  //
  const t = useStoreT()
  const rowIndex = (index: number) => index + 1
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
        <div className="u-flex u-gap-8">
          <Button type="primary" icon={<i className="icons-transfer icon-size-13" />} onClick={() => setCreating(true)}>
            {t('transfers.newTransfer')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<i className={['icons-reload icon-size-18', isFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />} onClick={() => refetch()} />
          </Tooltip>
        </div>
      </div>

      <div className="card u-overflow-hidden u-p-0" >
        <div className="u-items-center u-border-b-default u-flex u-gap-10 u-p-14-16">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                }}
                allowClear
                placeholder={t('transfers.filterAll')}
                className="u-min-w-180"
                options={statusOptions}
              />
            )}
          />
          <span className="u-text-muted u-fs-12-5 u-ml-auto">
            <strong>{transfers.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Transfer>
          rowKey="id"
          dataSource={transfers}
          columns={columns}
          loading={isLoading}
          pagination={false}
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
          <div className="u-flex u-flex-col u-gap-12">
            <Alert type="warning" showIcon message={t('transfers.confirmReceiptWarning')} description={t('transfers.confirmReceiptDesc')} />
            <div className="u-grid u-fs-13 u-gap-8">
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
