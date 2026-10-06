import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'

import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { PriceInput } from './PriceInput'
import { QuantityStepper } from './QuantityStepper'
import { getPriceError } from './stockInPrices'
import type { StockInCartItem } from './types'

interface StockInColumnsOptions {
  t: StoreTranslator
  onChangeQty: (key: string, delta: number) => void
  onUpdateQty: (key: string, value: number | null) => void
  onUpdateItem: (key: string, patch: Partial<StockInCartItem>) => void
  onRemoveItem: (key: string) => void
}

export function createStockInColumns({ t, onChangeQty, onUpdateQty, onUpdateItem, onRemoveItem }: StockInColumnsOptions) {
  //
  return [
    {
      title: t('stockIn.colProduct'),
      key: 'product',
      width: 220,
      render: (_: unknown, item: StockInCartItem) => (
        <div className="u-max-w-270 u-min-w-0">
          <div className="u-fs-13 u-fw-600 u-lh-tight">
            <EllipsisText maxWidth="100%">{item.product.name}</EllipsisText>
          </div>
          {item.product.sku ? (
            <div className="num u-text-muted u-fs-11 u-max-w-180 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap" >
              {item.product.sku}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('stockIn.colQty'),
      key: 'qty',
      width: 200,
      render: (_: unknown, item: StockInCartItem) => (
        <QuantityStepper
          value={item.quantity}
          unitLabel={t(`units.${item.product.unit}`)}
          onMinus={() => onChangeQty(item._key, -1)}
          onPlus={() => onChangeQty(item._key, 1)}
          onChange={(value) => onUpdateQty(item._key, value)}
        />
      ),
    },
    {
      title: t('products.colCost'),
      key: 'cost',
      width: 150,
      render: (_: unknown, item: StockInCartItem) => (
        <PriceInput
          item={item}
          field="costPrice"
          error={getPriceError(item) === 'costExceedsWholesale' ? t('validation.costExceedsWholesale') : null}
          onUpdateItem={onUpdateItem}
        />
      ),
    },
    {
      title: t('products.colWholesale'),
      key: 'wholesale',
      width: 150,
      render: (_: unknown, item: StockInCartItem) => (
        <PriceInput
          item={item}
          field="wholesalePrice"
          error={getPriceError(item) === 'wholesaleExceedsRetail' ? t('validation.wholesaleExceedsRetail') : null}
          onUpdateItem={onUpdateItem}
        />
      ),
    },
    {
      title: t('products.colRetail'),
      key: 'retail',
      width: 150,
      render: (_: unknown, item: StockInCartItem) => (
        <PriceInput item={item} field="retailPrice" error={null} onUpdateItem={onUpdateItem} />
      ),
    },
    {
      title: t('stockIn.colTotal'),
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: (_: unknown, item: StockInCartItem) => (
        <span className="num u-inline-block u-fs-13 u-fw-700 u-max-w-140 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap" >
          <MoneyDisplay amount={Math.max(item.quantity, 0) * item.costPrice} currency={item.currency} compact />
        </span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 32,
      render: (_: unknown, item: StockInCartItem) => (
        <Button size="small" type="text" danger icon={<StoreIcon name="trash" size={16} />} onClick={() => onRemoveItem(item._key)} />
      ),
    },
  ]
}
