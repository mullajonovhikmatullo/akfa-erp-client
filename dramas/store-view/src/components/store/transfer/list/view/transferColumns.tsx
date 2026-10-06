import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'

import { formatDateTime } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { TransferStatus, TransferSummary } from '@store/store-stub'

export const TRANSFER_STATUS_TONE: Record<TransferStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export function transferStatusLabel(t: StoreTranslator, status: TransferStatus) {
  //
  const labels: Record<TransferStatus, string> = {
    PENDING: t('transfers.statusPendingLabel'),
    COMPLETED: t('transfers.statusCompleted'),
    CANCELLED: t('transfers.statusCancelled'),
  }
  return labels[status]
}

type TransferColumnsOptions = {
  t: StoreTranslator
  rowIndex: (index: number) => number
}

export function createTransferColumns({ t, rowIndex }: TransferColumnsOptions): ColumnDef<TransferSummary>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: TransferSummary, index: number) => (
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => <span className="u-text-muted u-fs-12">{formatDateTime(value)}</span>,
    },
    {
      title: t('transfers.colRoute'),
      key: 'route',
      render: (_: unknown, transfer: TransferSummary) => (
        <div className="u-flex u-flex-col u-gap-4 u-min-w-0">
          <div className="u-items-center u-flex u-gap-8">
            <StatusBadge tone="info">{transfer.fromBranch.name}</StatusBadge>
            <StoreIcon name="arrow-right" size={16} className="u-text-quiet" />
            <StatusBadge tone="muted">{transfer.toBranch.name}</StatusBadge>
          </div>
          {transfer.note ? (
            <div className="u-items-center u-flex u-gap-4 u-max-w-320 u-text-muted u-fs-12" title={transfer.note}>
              <StoreIcon name="pen-line" size={13} className="u-text-quiet" />
              <span className="u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{transfer.note}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('nav.products'),
      key: 'items',
      width: 100,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, transfer: TransferSummary) => (
        <span className="num u-text-muted u-fs-13">
          {transfer.itemCount} {t('transfers.itemTypeSuffix')}
        </span>
      ),
    },
    {
      title: t('transfers.colCost'),
      key: 'cost',
      width: 160,
      align: 'right',
      render: (_: unknown, transfer: TransferSummary) => (
        <span className="num u-fw-700">
          <MoneyDisplay amount={transfer.totalCostUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 140,
      render: (value: TransferStatus) => (
        <StatusBadge tone={TRANSFER_STATUS_TONE[value]} dot>
          {transferStatusLabel(t, value)}
        </StatusBadge>
      ),
    },
    {
      title: t('transfers.colCreatedBy'),
      key: 'initiatedBy',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, transfer: TransferSummary) => (
        <span className="u-text-muted u-fs-12-5">{transfer.initiatedBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'open',
      width: 44,
      align: 'center',
      render: () => <StoreIcon name="chevron-right" size={16} className="u-text-quiet" />,
    },
  ]
}
