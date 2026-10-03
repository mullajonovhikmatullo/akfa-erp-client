import { Tag, type TableColumnsType } from 'antd'
import { AuthenticatedProductImage } from '../../product/images/AuthenticatedProductImage'
import type { ProductUnit, StockLevel } from '@store/store-stub'
import { formatInventoryQuantity } from '../lib/inventory-rows'
import type { InventoryTranslate } from './types'

interface InventoryColumnsOptions {
  t: InventoryTranslate
  rowIndex: (index: number) => number
}

export function createInventoryColumns({ t, rowIndex }: InventoryColumnsOptions): TableColumnsType<StockLevel> {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 56,
      render: (_value, _row, index) => (
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
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
          <div className="inventory-product-cell__text"><strong>{row.name}</strong><small>{row.sku || '—'}</small></div>
        </div>
      ),
    },
    {
      title: t('inventory.branches'),
      key: 'branches',
      width: 150,
      render: (_value, row) => (
        <div className="inventory-branches-cell" title={row.branches.map((branch) => branch.name).join(', ')}>
          {row.branches.map((branch) => <Tag key={branch.id}>{branch.name}</Tag>)}
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
      render: (quantity: number, row) => {
        //
        const isLowStock =
          quantity > 0 && row.lowStockThreshold != null && quantity <= row.lowStockThreshold

        return (
          <div className="inventory-quantity-cell">
            <strong className="inventory-quantity">
              {formatInventoryQuantity(quantity)} <small>{t(`units.${row.unit}`)}</small>
            </strong>
            {quantity <= 0 ? (
              <Tag color={row.everStocked ? 'red' : 'blue'}>
                {t(row.everStocked ? 'inventory.statusOut' : 'inventory.statusNotStocked')}
              </Tag>
            ) : null}
            {isLowStock ? <Tag color="orange">{t('inventory.statusLow')}</Tag> : null}
          </div>
        )
      },
    },
  ]
}
