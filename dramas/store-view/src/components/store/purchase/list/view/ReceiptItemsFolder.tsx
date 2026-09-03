import { Tag } from 'antd'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { StockBatch, StockReceipt } from '@store/store-stub'
import { useStockReceiptItemsPage } from '../../../inventory/hooks/useStockReceiptItemsPage'
import { createReceiptItemColumns } from './receiptColumns'

export function ReceiptItemsFolder({ receipt, t }: { receipt: StockReceipt; t: (key: string) => string }) {
  //
  const query = useStockReceiptItemsPage(receipt.id, 25)
  const { page, pageSize, onPageChange } = query

  return (
    <div className="purchase-folder-content" onClick={(event) => event.stopPropagation()}>
      <div className="purchase-folder-title">
        <div><strong>{t('purchases.receiptDetails')}</strong><span>{receipt.productCount} {t('purchases.productTypes').toLocaleLowerCase()}</span></div>
        <Tag color="blue">{formatDateTime(receipt.receivedAt)}</Tag>
      </div>
      <DataTable<StockBatch>
        rowKey="id"
        dataSource={query.data?.items ?? []}
        columns={createReceiptItemColumns(t, page, pageSize)}
        loading={query.isLoading}
        pagination={{
          current: page,
          pageSize,
          total: query.data?.total ?? 0,
          showSizeChanger: true,
          hideOnSinglePage: (query.data?.total ?? 0) <= pageSize,
          pageSizeOptions: ['25', '50', '100'],
          onChange: onPageChange,
        }}
        emptyText={t('purchases.empty')}
      />
    </div>
  )
}
