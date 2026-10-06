import { Skeleton } from 'antd'
import { useMemo } from 'react'

import { useStoreT } from '@store/store-i18n'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useStockReceiptDetail } from '../../inventory/hooks/useStockReceiptDetail'
import { useStockReceiptItemsPage } from '../../inventory/hooks/useStockReceiptItemsPage'
import { DetailNotFound } from '../../shared/view/DetailNotFound'
import { DetailPageHeader } from '../../shared/view/DetailPageHeader'
import { ReceiptDetailView } from './view/ReceiptDetailView'

interface ReceiptDetailPanelProps {
  receiptId: string
  onBack: () => void
}

export function ReceiptDetailPanel({ receiptId, onBack }: ReceiptDetailPanelProps) {
  //
  const t = useStoreT()
  const receiptQuery = useStockReceiptDetail(receiptId)
  const itemsQuery = useStockReceiptItemsPage(receiptId, 25)
  const { data: branches = [] } = useBranchesList()
  const branchNameById = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name])), [branches])
  const receipt = receiptQuery.data

  if (receiptQuery.isLoading) {
    return <section className="detail-page"><div className="card u-p-16-20"><Skeleton active paragraph={{ rows: 8 }} /></div></section>
  }

  if (!receipt) {
    return (
      <section className="detail-page">
        <DetailNotFound
          title={t('purchases.notFound')}
          hint={t('purchases.notFoundHint')}
          backLabel={t('purchases.backToList')}
          onBack={onBack}
        />
      </section>
    )
  }

  const supplierNote = receipt.supplierNote ? (branchNameById.get(receipt.supplierNote) ?? receipt.supplierNote) : null

  return (
    <section className="detail-page">
      <DetailPageHeader
        t={t}
        backLabel={t('purchases.backToList')}
        title={t('purchases.receiptDetails')}
        meta={<span>{formatDateTime(receipt.receivedAt)}</span>}
        refreshing={receiptQuery.isFetching || itemsQuery.isFetching}
        onBack={onBack}
        onRefresh={() => {
          //
          void receiptQuery.refetch()
          void itemsQuery.refetch()
        }}
      />
      <ReceiptDetailView
        t={t}
        receipt={receipt}
        supplierNote={supplierNote}
        items={itemsQuery.data?.items ?? []}
        itemsTotal={itemsQuery.data?.total ?? 0}
        itemsLoading={itemsQuery.isLoading}
        page={itemsQuery.page}
        pageSize={itemsQuery.pageSize}
        onPageChange={itemsQuery.onPageChange}
      />
    </section>
  )
}
