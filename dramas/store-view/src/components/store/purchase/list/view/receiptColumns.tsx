import type { StoreTranslator } from '@store/store-i18n'
import { Tag } from 'antd'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { BranchName } from '@store/store-shared/ui/branch-name'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { StockBatch, StockReceipt } from '@store/store-stub'

export function createReceiptColumns({
  t,
  rowIndex,
  supplierNote,
}: {
  t: StoreTranslator
  rowIndex: (index: number) => number
  supplierNote: (note: string | null) => string | null
}): ColumnDef<StockReceipt>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 42,
      render: (_value, _receipt, index) => <span className="purchase-row-index">{rowIndex(index)}</span>,
    },
    {
      title: t('purchases.receivedAt'),
      dataIndex: 'receivedAt',
      width: 160,
      render: (value: string) => <span className="purchase-date">{formatDateTime(value)}</span>,
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 160,
      render: (_value, receipt) => <BranchName name={receipt.branch.name} as="badge" tone="info" />,
    },
    {
      title: t('purchases.productTypes'),
      dataIndex: 'productCount',
      width: 130,
      align: 'right',
      render: (count: number) => <strong className="num">{count}</strong>,
    },
    {
      title: t('purchases.totalQuantity'),
      key: 'quantity',
      width: 190,
      render: (_value, receipt) => (
        <div className="purchase-quantity-tags">
          {receipt.pieceQuantity > 0 ? <Tag color="blue">{receipt.pieceQuantity.toLocaleString('ru-RU')} {t('units.PIECE')}</Tag> : null}
          {receipt.kgQuantity > 0 ? <Tag color="cyan">{receipt.kgQuantity.toLocaleString('ru-RU')} {t('units.KG')}</Tag> : null}
          {receipt.pieceQuantity === 0 && receipt.kgQuantity === 0 ? '—' : null}
        </div>
      ),
    },
    {
      title: t('purchases.colTotalCost'),
      dataIndex: 'totalCostUzs',
      width: 170,
      align: 'right',
      render: (amount: number) => <strong className="num"><MoneyDisplay amount={amount} currency="UZS" /></strong>,
    },
    {
      title: t('purchases.colSupplierNote'),
      dataIndex: 'supplierNote',
      responsiveHide: true,
      render: (value: string | null) => {
        //
        const note = supplierNote(value)
        return note ? <EllipsisText maxWidth={190}>{note}</EllipsisText> : <span className="purchase-empty-value">—</span>
      },
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 150,
      responsiveHide: true,
      render: (_value, receipt) => <span className="purchase-created-by">{receipt.createdBy.fullName}</span>,
    },
  ]
}

export function createReceiptItemColumns(t: StoreTranslator, page: number, pageSize: number): ColumnDef<StockBatch>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 44,
      render: (_value, _batch, index) => <span className="purchase-row-index">{(page - 1) * pageSize + index + 1}</span>,
    },
    {
      title: t('nav.products'),
      key: 'product',
      render: (_value, batch) => <div className="purchase-product-cell"><strong>{batch.product.name}</strong><small>{batch.product.sku || '—'}</small></div>,
    },
    {
      title: t('purchases.colQty'),
      dataIndex: 'initialQty',
      width: 130,
      align: 'right',
      render: (quantity: number, batch) => <strong className="num">{quantity.toLocaleString('ru-RU')} {t(`units.${batch.product.unit}`)}</strong>,
    },
    {
      title: t('purchases.colRemaining'),
      dataIndex: 'remainingQty',
      width: 140,
      align: 'right',
      render: (quantity: number, batch) => <strong className={`num ${quantity > 0 ? 'tone-success' : 'tone-quiet'}`}>{quantity.toLocaleString('ru-RU')} {t(`units.${batch.product.unit}`)}</strong>,
    },
    {
      title: t('purchases.colCost'),
      dataIndex: 'costPriceUzs',
      width: 155,
      align: 'right',
      render: (amount: number) => <MoneyDisplay amount={amount} currency="UZS" />,
    },
    {
      title: t('purchases.colTotalCost'),
      key: 'total',
      width: 170,
      align: 'right',
      render: (_value, batch) => <strong><MoneyDisplay amount={batch.initialQty * batch.costPriceUzs} currency="UZS" /></strong>,
    },
  ]
}
