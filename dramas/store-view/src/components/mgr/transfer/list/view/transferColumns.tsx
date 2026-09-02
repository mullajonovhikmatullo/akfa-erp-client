import { Button, Popconfirm, Table } from 'antd'
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { DataTable, type ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Transfer, TransferStatus } from '@store/store-stub'

const STATUS_TONE: Record<TransferStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

type TransferColumnsOptions = {
  t: (key: string) => string
  rowIndex: (index: number) => number
  statusLabel: Record<TransferStatus, string>
  isStoreOwner: boolean
  userBranchId?: string | null
  userId?: string | null
  cancelPending: boolean
  onComplete: (transfer: Transfer) => void
  onCancel: (id: string) => void
}

export function createTransferColumns({
  t,
  rowIndex,
  statusLabel,
  isStoreOwner,
  userBranchId,
  userId,
  cancelPending,
  onComplete,
  onCancel,
}: TransferColumnsOptions): ColumnDef<Transfer>[] {
  //
  return [
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
        const canComplete = isReceiverBranch
        const canCancel = isStoreOwner || (!isReceiverBranch && transfer.initiatedBy.id === userId)
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
                  onComplete(transfer)
                }}
              />
            ) : null}
            {canCancel ? (
              <Popconfirm
                title={t('transfers.cancelTitle')}
                description={t('transfers.cancelDesc')}
                okText={t('transfers.cancelOk')}
                cancelText={t('common.no')}
                okButtonProps={{ danger: true, loading: cancelPending }}
                onConfirm={(event) => {
                  //
                  event?.stopPropagation()
                  onCancel(transfer.id)
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
}

export function createTransferConfirmColumns(t: (key: string) => string): ColumnDef<Transfer['items'][number]>[] {
  //
  return [
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
    {
      title: t('transfers.colCost'),
      key: 'unitCost',
      width: 165,
      align: 'right',
      render: (_, item) => (
        <span className="num" style={{ whiteSpace: 'nowrap' }}>
          <MoneyDisplay amount={item.unitCostUzs} currency="UZS" />
          <span style={{ marginLeft: 4, color: 'var(--ink-3)', fontSize: 11 }}>/ {t(`units.${item.product.unit}`)}</span>
        </span>
      ),
    },
    {
      title: t('transfers.colTotal'),
      key: 'totalCost',
      width: 150,
      align: 'right',
      render: (_, item) => (
        <span className="num" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
        </span>
      ),
    },
  ]
}

export function ExpandedTransferRow({ transfer, t }: { transfer: Transfer; t: (key: string) => string }) {
  //
  return (
    <div style={{ padding: '8px 0 8px 48px' }}>
      <DataTable<Transfer['items'][number]>
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
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>&quot;{transfer.note}&quot;</div>
      ) : null}
      {transfer.completedBy ? (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-3)' }}>
          {t('transfers.completedByLabel')}: {transfer.completedBy.fullName} · {formatDateTime(transfer.completedAt)}
        </div>
      ) : null}
    </div>
  )
}
