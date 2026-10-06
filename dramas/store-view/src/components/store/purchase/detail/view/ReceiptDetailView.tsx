import type { StoreTranslator } from '@store/store-i18n'
import { Tag } from 'antd'

import { formatDateTime } from '@store/store-shared/lib/formatters'
import { BranchName } from '@store/store-shared/ui/branch-name'
import { DataTable } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { StockBatch, StockReceipt } from '@store/store-stub'
import { createReceiptItemColumns } from '../../list/view/receiptColumns'

interface ReceiptDetailViewProps {
  t: StoreTranslator
  receipt: StockReceipt
  supplierNote: string | null
  items: StockBatch[]
  itemsTotal: number
  itemsLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}

export function ReceiptDetailView({
  t,
  receipt,
  supplierNote,
  items,
  itemsTotal,
  itemsLoading,
  page,
  pageSize,
  onPageChange,
}: ReceiptDetailViewProps) {
  //
  return (
    <div className="u-flex u-flex-col u-gap-16">
      <div className="detail-hero">
        <div className="u-items-center u-flex u-flex-wrap u-gap-8">
          <BranchName name={receipt.branch.name} as="badge" tone="info" />
          <span className="u-text-muted u-fs-12">{formatDateTime(receipt.receivedAt)}</span>
          <span className="u-ml-auto u-text-muted u-fs-12">{receipt.createdBy.fullName}</span>
        </div>
        <div className="detail-hero__total num">
          <MoneyDisplay amount={receipt.totalCostUzs} currency="UZS" />
        </div>
        <div className="u-items-center u-flex u-flex-wrap u-gap-6">
          <span className="u-text-muted u-fs-12">
            {receipt.productCount} {t('purchases.productTypes').toLocaleLowerCase()}
          </span>
          {receipt.pieceQuantity > 0 ? <Tag color="blue">{receipt.pieceQuantity.toLocaleString('ru-RU')} {t('units.PIECE')}</Tag> : null}
          {receipt.kgQuantity > 0 ? <Tag color="cyan">{receipt.kgQuantity.toLocaleString('ru-RU')} {t('units.KG')}</Tag> : null}
          <span className="u-ml-auto u-text-muted u-fs-12">
            {t('purchases.colRemaining')}: <strong className="num"><MoneyDisplay amount={receipt.remainingValueUzs} currency="UZS" /></strong>
          </span>
        </div>
        {supplierNote ? (
          <div className="u-fs-13">
            <span className="u-text-muted">{t('purchases.colSupplierNote')}:</span> {supplierNote}
          </div>
        ) : null}
      </div>

      <DataTable<StockBatch>
        rowKey="id"
        dataSource={items}
        columns={createReceiptItemColumns(t, page, pageSize)}
        loading={itemsLoading}
        pagination={{
          current: page,
          pageSize,
          total: itemsTotal,
          showSizeChanger: true,
          hideOnSinglePage: itemsTotal <= pageSize,
          pageSizeOptions: ['25', '50', '100'],
          onChange: onPageChange,
        }}
        emptyText={t('purchases.empty')}
      />
    </div>
  )
}
