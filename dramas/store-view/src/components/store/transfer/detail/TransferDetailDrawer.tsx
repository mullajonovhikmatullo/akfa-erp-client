import type { StoreTranslator } from '@store/store-i18n'
import { Drawer, Skeleton } from 'antd'

import { useTransferDetail } from '../hooks/useTransferDetail'
import { useTransferMutation } from '../hooks/useTransferMutation'
import { TransferDetailView } from './view/TransferDetailView'

interface TransferDetailDrawerProps {
  t: StoreTranslator
  transferId: string | null
  isStoreOwner: boolean
  userBranchId?: string | null
  userId?: string | null
  onClose: () => void
}

export function TransferDetailDrawer({ t, transferId, isStoreOwner, userBranchId, userId, onClose }: TransferDetailDrawerProps) {
  //
  const { data: transfer, isLoading } = useTransferDetail(transferId)
  const { completeTransfer, cancelTransfer } = useTransferMutation(t)
  const isReceiverBranch = transfer?.toBranch.id === userBranchId
  const isPending = transfer?.status === 'PENDING'
  const canComplete = Boolean(isPending && isReceiverBranch)
  const canCancel = Boolean(isPending && (isStoreOwner || (!isReceiverBranch && transfer?.initiatedBy.id === userId)))

  return (
    <Drawer
      rootClassName="ant-drawer-root"
      title={t('transfers.detailTitle')}
      open={Boolean(transferId)}
      onClose={onClose}
      width={720}
      closable={{ placement: 'end' }}
      destroyOnHidden
    >
      {isLoading || !transfer ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <TransferDetailView
          t={t}
          transfer={transfer}
          canComplete={canComplete}
          canCancel={canCancel}
          completing={completeTransfer.isPending}
          cancelling={cancelTransfer.isPending}
          onComplete={() => completeTransfer.mutate(transfer.id, { onSuccess: onClose })}
          onCancel={() => cancelTransfer.mutate(transfer.id, { onSuccess: onClose })}
        />
      )}
    </Drawer>
  )
}
