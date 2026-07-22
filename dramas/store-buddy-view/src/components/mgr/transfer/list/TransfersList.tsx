import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, Modal, Popconfirm, Select, Table, Tooltip } from 'antd'
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  ArrowsLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { formatDateTime } from '@erp/erp-shared/lib/formatters'
import { DataTable, type ColumnDef } from '@erp/erp-shared/ui/data-table'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { Transfer, TransferStatus } from '@erp/store-buddy-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { NewTransferModal } from '../form/NewTransferModal'
import { useCancelTransfer, useCompleteTransfer, useTransfers } from '../hooks/useTransfers'

const STATUS_TONE: Record<TransferStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

type TransferFiltersForm = {
  status?: TransferStatus
}

interface TransfersListProps {
  t: (key: string) => string
  isSuper: boolean
  userBranchId?: string | null
  userId?: string | null
  exchangeRate: number
}

export function TransfersList({ t, isSuper, userBranchId, userId, exchangeRate }: TransfersListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<TransferFiltersForm>({
    defaultValues: { status: undefined },
  })
  const filters = watch()
  const [creating, setCreating] = useState(false)
  const [confirmingTransfer, setConfirmingTransfer] = useState<Transfer | null>(null)

  const { data: transfers = [], isLoading, isFetching, refetch } = useTransfers({
    status: filters.status,
    limit: 100,
  })

  const completeTransfer = useCompleteTransfer()
  const cancelTransfer = useCancelTransfer()

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

  const columns: ColumnDef<Transfer>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Transfer, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 120,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDateTime(value)}</span>,
    },
    {
      title: t('transfers.colRoute'),
      key: 'route',
      render: (_: unknown, transfer: Transfer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge tone="info">{transfer.fromBranch.name}</StatusBadge>
          <ArrowRightIcon size={14} color="currentColor" style={{ color: 'var(--ink-4)' }} />
          <StatusBadge tone="muted">{transfer.toBranch.name}</StatusBadge>
        </div>
      ),
    },
    {
      title: t('nav.products'),
      key: 'items',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, transfer: Transfer) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {transfer.items.length} {t('transfers.itemTypeSuffix')}
        </span>
      ),
    },
    {
      title: t('transfers.colCost'),
      key: 'cost',
      width: 160,
      align: 'right',
      render: (_: unknown, transfer: Transfer) => {
        //
        const total = transfer.items.reduce((sum, item) => sum + item.totalCostUzs, 0)
        return (
          <span className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={total} currency="UZS" />
          </span>
        )
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 140,
      render: (value: TransferStatus) => (
        <StatusBadge tone={STATUS_TONE[value]} dot>
          {statusLabel[value]}
        </StatusBadge>
      ),
    },
    {
      title: t('transfers.colCreatedBy'),
      key: 'initiatedBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, transfer: Transfer) => (
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{transfer.initiatedBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, transfer: Transfer) => {
        //
        if (transfer.status !== 'PENDING') return null
        const isReceiverBranch = transfer.toBranch.id === userBranchId
        const canComplete = !isSuper && isReceiverBranch
        const canCancel = isSuper || (!isReceiverBranch && transfer.initiatedBy.id === userId)
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            {canComplete ? (
              <Button
                size="small"
                type="text"
                icon={<CheckCircleIcon size={18} weight="duotone" color="currentColor" style={{ color: 'var(--success)' }} />}
                onClick={(event) => {
                  //
                  event.stopPropagation()
                  setConfirmingTransfer(transfer)
                }}
              />
            ) : null}
            {canCancel ? (
              <Popconfirm
                title={t('transfers.cancelTitle')}
                description={t('transfers.cancelDesc')}
                okText={t('transfers.cancelOk')}
                cancelText={t('common.no')}
                okButtonProps={{ danger: true, loading: cancelTransfer.isPending }}
                onConfirm={(event) => {
                  //
                  event?.stopPropagation()
                  cancelTransfer.mutate(transfer.id)
                }}
                onPopupClick={(event) => event.stopPropagation()}
              >
                <Button size="small" type="text" danger icon={<XCircleIcon size={18} />} onClick={(event) => event.stopPropagation()} />
              </Popconfirm>
            ) : null}
          </div>
        )
      },
    },
  ]

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
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<ArrowsLeftRightIcon size={18} weight="bold" />} onClick={() => setCreating(true)}>
            {t('transfers.newTransfer')}
          </Button>
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
        isSuper={isSuper}
        userBranchId={userBranchId}
        exchangeRate={exchangeRate}
        open={creating}
        onClose={() => setCreating(false)}
      />
      <Modal
        open={Boolean(confirmingTransfer)}
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
              <InfoRow label={t('transfers.colCost')} value={<MoneyDisplay amount={confirmingTotal} currency="UZS" />} />
            </div>
            <Table<Transfer['items'][number]>
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={confirmingTransfer.items}
              columns={[
                {
                  title: t('transfers.colProduct'),
                  key: 'product',
                  render: (_, item) => item.product.name,
                },
                {
                  title: t('transfers.colQty'),
                  key: 'quantity',
                  width: 130,
                  align: 'right',
                  render: (_, item) => (
                    <span className="num">
                      {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  //
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function ExpandedTransferRow({ transfer, t }: { transfer: Transfer; t: (key: string) => string }) {
  //
  return (
    <div style={{ padding: '8px 0 8px 48px' }}>
      <Table<Transfer['items'][number]>
        size="small"
        pagination={false}
        rowKey="id"
        dataSource={transfer.items}
        columns={[
          {
            title: t('transfers.colProduct'),
            key: 'name',
            render: (_, item) => (
              <div>
                <span style={{ fontWeight: 500 }}>{item.product.name}</span>
                {item.product.sku ? (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{item.product.sku}</span>
                ) : null}
              </div>
            ),
          },
          {
            title: t('transfers.colQty'),
            key: 'qty',
            width: 120,
            align: 'right',
            render: (_, item) => (
              <span className="num">
                {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
              </span>
            ),
          },
          {
            title: t('transfers.colCost'),
            key: 'unit',
            width: 150,
            align: 'right',
            render: (_, item) => (
              <span className="num">
                <MoneyDisplay amount={item.unitCostUzs} currency="UZS" />
              </span>
            ),
          },
          {
            title: t('transfers.colTotal'),
            key: 'total',
            width: 150,
            align: 'right',
            render: (_, item) => (
              <span className="num" style={{ fontWeight: 700 }}>
                <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
              </span>
            ),
          },
        ]}
      />
      {transfer.note ? (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>"{transfer.note}"</div>
      ) : null}
      {transfer.completedBy ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-3)' }}>
          {t('transfers.completedByLabel')}: {transfer.completedBy.fullName} · {formatDateTime(transfer.completedAt)}
        </div>
      ) : null}
    </div>
  )
}
