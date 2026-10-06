import type { StoreTranslator } from '@store/store-i18n'
import { useEffect } from 'react'
import { Drawer } from 'antd'

import type { StockReceipt } from '@store/store-stub'
import { useStockReceiptItemsPage } from '../../inventory/hooks/useStockReceiptItemsPage'
import { ReceiptDetailView } from './view/ReceiptDetailView'

interface ReceiptDetailDrawerProps {
  t: StoreTranslator
  receipt: StockReceipt | null
  supplierNote: (note: string | null) => string | null
  onClose: () => void
}

export function ReceiptDetailDrawer({ t, receipt, supplierNote, onClose }: ReceiptDetailDrawerProps) {
  //
  const itemsQuery = useStockReceiptItemsPage(receipt?.id, 25)
  const { resetPage } = itemsQuery

  useEffect(() => {
    //
    resetPage()
  }, [receipt?.id, resetPage])

  return (
    <Drawer
      rootClassName="ant-drawer-root"
      title={t('purchases.receiptDetails')}
      open={Boolean(receipt)}
      onClose={onClose}
      width={1040}
      closable={{ placement: 'end' }}
      destroyOnHidden
    >
      {receipt ? (
        <ReceiptDetailView
          t={t}
          receipt={receipt}
          supplierNote={supplierNote(receipt.supplierNote)}
          items={itemsQuery.data?.items ?? []}
          itemsTotal={itemsQuery.data?.total ?? 0}
          itemsLoading={itemsQuery.isLoading || (itemsQuery.isFetching && !itemsQuery.data)}
          page={itemsQuery.page}
          pageSize={itemsQuery.pageSize}
          onPageChange={itemsQuery.onPageChange}
        />
      ) : null}
    </Drawer>
  )
}
