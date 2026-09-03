import { Button, Popconfirm } from 'antd'

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
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 120,
      render: (value: string) => <span className="u-text-muted u-fs-12">{formatDateTime(value)}</span>,
    },
    {
      title: t('transfers.colRoute'),
      key: 'route',
      render: (_: unknown, transfer: Transfer) => (
        <div className="u-items-center u-flex u-gap-8">
          <StatusBadge tone="info">{transfer.fromBranch.name}</StatusBadge>
          <i className="icons-arrow-right icon-size-14 u-text-quiet" />
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
        <span className="num u-text-muted u-fs-13" >
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
          <span className="num u-fw-700" >
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
        <span className="u-text-muted u-fs-12-5">{transfer.initiatedBy.fullName}</span>
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
          <div className="u-flex u-gap-4">
            {canComplete ? (
              <Button
                size="small"
                type="text"
                icon={<i className="icons-circle-check icon-size-18 u-text-success" />}
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
                <Button size="small" type="text" danger icon={<i className="icons-close-circle icon-size-18" />} onClick={(event) => event.stopPropagation()} />
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
        <span className="num u-whitespace-nowrap" >
          <MoneyDisplay amount={item.unitCostUzs} currency="UZS" />
          <span className="u-text-muted u-fs-11 u-ml-4">/ {t(`units.${item.product.unit}`)}</span>
        </span>
      ),
    },
    {
      title: t('transfers.colTotal'),
      key: 'totalCost',
      width: 150,
      align: 'right',
      render: (_, item) => (
        <span className="num u-fw-700 u-whitespace-nowrap" >
          <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
        </span>
      ),
    },
  ]
}

export function ExpandedTransferRow({ transfer, t }: { transfer: Transfer; t: (key: string) => string }) {
  //
  return (
    <div className="u-p-8-0-8-48">
      <DataTable<Transfer['items'][number]>
        rowKey="id"
        dataSource={transfer.items}
        columns={[
          {
            title: t('transfers.colProduct'),
            key: 'name',
            render: (_, item) => (
              <div>
                <span className="u-fw-500">{item.product.name}</span>
                {item.product.sku ? (
                  <span className="u-text-muted u-font-mono u-fs-11 u-ml-8">{item.product.sku}</span>
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
              <span className="num u-fw-700" >
                <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
              </span>
            ),
          },
        ]}
      />
      {transfer.note ? (
        <div className="u-text-muted u-fs-13 u-font-italic u-mt-8">&quot;{transfer.note}&quot;</div>
      ) : null}
      {transfer.completedBy ? (
        <div className="u-text-muted u-fs-12 u-mt-4">
          {t('transfers.completedByLabel')}: {transfer.completedBy.fullName} · {formatDateTime(transfer.completedAt)}
        </div>
      ) : null}
    </div>
  )
}
