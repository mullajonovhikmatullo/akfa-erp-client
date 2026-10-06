import { Skeleton } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { DetailNotFound } from '../../shared/view/DetailNotFound'
import { DetailPageHeader } from '../../shared/view/DetailPageHeader'
import { useTransferDetail } from '../hooks/useTransferDetail'
import { useTransferMutation } from '../hooks/useTransferMutation'
import { TransferDetailView } from './view/TransferDetailView'

interface TransferDetailPanelProps {
  transferId: string
  isStoreOwner: boolean
  userBranchId?: string | null
  userId?: string | null
  onBack: () => void
}

export function TransferDetailPanel({ transferId, isStoreOwner, userBranchId, userId, onBack }: TransferDetailPanelProps) {
  //
  const t = useStoreT()
  const transferQuery = useTransferDetail(transferId)
  const { completeTransfer, cancelTransfer } = useTransferMutation(t)
  const transfer = transferQuery.data
  const isReceiverBranch = transfer?.toBranch.id === userBranchId
  const isPending = transfer?.status === 'PENDING'
  const canComplete = Boolean(isPending && isReceiverBranch)
  const canCancel = Boolean(isPending && (isStoreOwner || (!isReceiverBranch && transfer?.initiatedBy.id === userId)))

  if (transferQuery.isLoading) {
    return <section className="detail-page"><div className="card u-p-16-20"><Skeleton active paragraph={{ rows: 8 }} /></div></section>
  }

  if (!transfer) {
    return (
      <section className="detail-page">
        <DetailNotFound
          title={t('transfers.notFound')}
          hint={t('transfers.notFoundHint')}
          backLabel={t('transfers.backToList')}
          onBack={onBack}
        />
      </section>
    )
  }

  return (
    <section className="detail-page">
      <DetailPageHeader
        t={t}
        backLabel={t('transfers.backToList')}
        title={t('transfers.detailTitle')}
        meta={<span>{formatDateTime(transfer.createdAt)}</span>}
        refreshing={transferQuery.isFetching}
        onBack={onBack}
        onRefresh={() => void transferQuery.refetch()}
      />
      <div className="card">
        <TransferDetailView
          t={t}
          transfer={transfer}
          canComplete={canComplete}
          canCancel={canCancel}
          completing={completeTransfer.isPending}
          cancelling={cancelTransfer.isPending}
          onComplete={() => completeTransfer.mutate(transfer.id)}
          onCancel={() => cancelTransfer.mutate(transfer.id)}
        />
      </div>
    </section>
  )
}
