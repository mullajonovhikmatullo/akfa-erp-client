import { Tag, type TableColumnsType } from 'antd'
import { AuthenticatedProductImage } from '../../product/images/AuthenticatedProductImage'
import type { ProductUnit } from '@store/store-stub'
import { formatInventoryQuantity } from '../lib/inventory-rows'
import type { InventoryTranslate, StockRow } from './types'

interface InventoryColumnsOptions {
  t: InventoryTranslate
  stockedProductIds: ReadonlySet<string>
  stockStatusAvailable: boolean
}

export function createInventoryColumns({
  t,
  stockedProductIds,
  stockStatusAvailable,
}: InventoryColumnsOptions): TableColumnsType<StockRow> {
  //
  return [
    {
      title: t('inventory.product'),
      key: 'product',
      render: (_value, row) => (
        <div className="inventory-product-cell">
          <AuthenticatedProductImage
            url={row.primaryThumbnailUrl}
            alt={row.name}
            width={42}
            height={42}
          />
          <div><strong>{row.name}</strong><small>{row.sku || '—'}</small></div>
        </div>
      ),
    },
    {
      title: t('inventory.branches'),
      key: 'branches',
      width: 150,
      render: (_value, row) => (
        <div className="inventory-branches-cell" title={[...row.branches].join(', ')}>
          {[...row.branches].map((branchName) => <Tag key={branchName}>{branchName}</Tag>)}
        </div>
      ),
    },
    {
      title: t('inventory.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 140,
      render: (unit: ProductUnit) => t(`units.${unit}`),
    },
    {
      title: t('inventory.available'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 190,
      align: 'right',
      sorter: (left, right) => left.quantity - right.quantity,
      render: (quantity: number, row) => {
        //
        const notStockedYet = stockStatusAvailable && !stockedProductIds.has(row.productId)
        const isLowStock =
          quantity > 0 && row.lowStockThreshold != null && quantity <= row.lowStockThreshold

        return (
          <div className="inventory-quantity-cell">
            <strong className="inventory-quantity">
              {formatInventoryQuantity(quantity)} <small>{t(`units.${row.unit}`)}</small>
            </strong>
            {quantity <= 0 ? (
              <Tag color={notStockedYet ? 'blue' : 'red'}>
                {t(notStockedYet ? 'inventory.statusNotStocked' : 'inventory.statusOut')}
              </Tag>
            ) : null}
            {isLowStock ? <Tag color="orange">{t('inventory.statusLow')}</Tag> : null}
          </div>
        )
      },
    },
  ]
}

