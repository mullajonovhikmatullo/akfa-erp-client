import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Alert, Button, Popconfirm, Table } from 'antd'

import { formatDateTime } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Transfer } from '@store/store-stub'
import { InfoRow } from '../../list/view/InfoRow'
import { TRANSFER_STATUS_TONE, transferStatusLabel } from '../../list/view/transferColumns'
import { createTransferItemColumns } from './transferItemColumns'

interface TransferDetailViewProps {
  t: StoreTranslator
  transfer: Transfer
  canComplete: boolean
  canCancel: boolean
  completing: boolean
  cancelling: boolean
  onComplete: () => void
  onCancel: () => void
}

export function TransferDetailView({ t, transfer, canComplete, canCancel, completing, cancelling, onComplete, onCancel }: TransferDetailViewProps) {
  //
  const total = transfer.items.reduce((sum, item) => sum + item.totalCostUzs, 0)

  return (
    <div className="u-flex u-flex-col u-gap-16">
      <div className="detail-hero">
        <div className="u-items-center u-flex u-flex-wrap u-gap-8">
          <StatusBadge tone="info">{transfer.fromBranch.name}</StatusBadge>
          <StoreIcon name="arrow-right" size={16} className="u-text-quiet" />
          <StatusBadge tone="muted">{transfer.toBranch.name}</StatusBadge>
          <span className="u-ml-auto">
            <StatusBadge tone={TRANSFER_STATUS_TONE[transfer.status]} dot>{transferStatusLabel(t, transfer.status)}</StatusBadge>
          </span>
        </div>
        <div className="detail-hero__total num">
          <MoneyDisplay amount={total} currency="UZS" />
        </div>
        <div className="u-text-muted u-fs-12">
          {transfer.items.length} {t('transfers.itemTypeSuffix')}
        </div>
      </div>

      <div className="u-grid u-fs-13 u-gap-8">
        <InfoRow label={t('common.date')} value={formatDateTime(transfer.createdAt)} />
        <InfoRow label={t('transfers.colCreatedBy')} value={transfer.initiatedBy.fullName} />
        {transfer.completedBy ? (
          <InfoRow label={t('transfers.completedByLabel')} value={`${transfer.completedBy.fullName} · ${formatDateTime(transfer.completedAt)}`} />
        ) : null}
        {transfer.note ? <InfoRow label={t('transfers.noteLabel')} value={transfer.note} /> : null}
      </div>

      <Table<Transfer['items'][number]>
        size="small"
        rowKey="id"
        pagination={transfer.items.length > 10 ? { pageSize: 10, size: 'small', showSizeChanger: false } : false}
        dataSource={transfer.items}
        columns={createTransferItemColumns(t)}
        scroll={{ x: 560 }}
      />

      {canComplete ? (
        <Alert type="warning" showIcon message={t('transfers.confirmReceiptWarning')} description={t('transfers.confirmReceiptDesc')} />
      ) : null}

      {canComplete || canCancel ? (
        <div className="u-flex u-gap-8 u-justify-end">
          {canCancel ? (
            <Popconfirm
              title={t('transfers.cancelTitle')}
              description={t('transfers.cancelDesc')}
              okText={t('transfers.cancelOk')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true, loading: cancelling }}
              onConfirm={onCancel}
            >
              <Button danger icon={<StoreIcon name="close-circle" size={16} />} loading={cancelling}>
                {t('transfers.cancelTransfer')}
              </Button>
            </Popconfirm>
          ) : null}
          {canComplete ? (
            <Popconfirm
              title={t('transfers.confirmReceiptTitle')}
              okText={t('transfers.confirmReceiptOk')}
              cancelText={t('transfers.confirmReceiptCancel')}
              okButtonProps={{ loading: completing }}
              onConfirm={onComplete}
            >
              <Button type="primary" icon={<StoreIcon name="circle-check" size={16} />} loading={completing}>
                {t('transfers.confirmReceiptOk')}
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
