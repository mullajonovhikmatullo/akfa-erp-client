import type { StoreTranslator } from '@store/store-i18n'
import { Button, InputNumber } from 'antd'

import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { QuantityStepper } from './QuantityStepper'
import type { TransferCartItem } from './types'

interface TransferColumnsOptions {
  t: StoreTranslator
  stockByProductId: Map<string, number>
  onChangeQty: (key: string, delta: number) => void
  onUpdateQty: (key: string, value: number | null) => void
  onUpdateItem: (key: string, patch: Partial<TransferCartItem>) => void
  onRemoveItem: (key: string) => void
}

export function createTransferColumns({ t, stockByProductId, onChangeQty, onUpdateQty, onUpdateItem, onRemoveItem }: TransferColumnsOptions) {
  //
  return [
    {
      title: t('transferModal.colProduct'),
      key: 'product',
      width: 270,
      render: (_: unknown, item: TransferCartItem) => (
        <div className="u-max-w-270 u-min-w-0">
          <div className="u-fs-13 u-fw-600 u-lh-tight">
            <EllipsisText maxWidth="100%">{item.product.name}</EllipsisText>
          </div>
          {item.product.sku ? (
            <div
              className="num u-text-muted u-fs-11 u-max-w-180 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap"

            >
              {item.product.sku}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('transferModal.colQty'),
      key: 'qty',
      width: 240,
      render: (_: unknown, item: TransferCartItem) => {
        //
        const stock = stockByProductId.get(item.productId) ?? 0
        return (
          <QuantityStepper
            value={item.quantity}
            max={stock}
            unitLabel={t(`units.${item.product.unit}`)}
            onMinus={() => onChangeQty(item._key, -1)}
            onPlus={() => onChangeQty(item._key, 1)}
            onChange={(value) => onUpdateQty(item._key, value)}
          />
        )
      },
    },
    {
      title: t('newSale.colRemainingStock'),
      key: 'stock',
      width: 140,
      align: 'right' as const,
      render: (_: unknown, item: TransferCartItem) => {
        //
        const stock = stockByProductId.get(item.productId) ?? 0
        const hasInsufficientStock = item.quantity > stock
        const remainingStock = stock - item.quantity
        return (
          <span className={`num transfer-stock-value${hasInsufficientStock ? ' tone-danger' : ''}`}>
            {hasInsufficientStock ? '—' : `${remainingStock.toLocaleString('ru-RU')} ${t(`units.${item.product.unit}`)}`}
          </span>
        )
      },
    },
    {
      title: t('transferModal.colCost'),
      key: 'cost',
      width: 170,
      render: (_: unknown, item: TransferCartItem) => (
        <InputNumber<number>
          value={item.unitCostUzs}
          onChange={(value) => onUpdateItem(item._key, { unitCostUzs: value ?? 0 })}
          min={0}
          step={1000}
          className="u-w-full"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          parser={(value) => Number(value?.replace(/\s/g, ''))}
        />
      ),
    },
    {
      title: t('transferModal.colTotal'),
      key: 'total',
      width: 200,
      align: 'right' as const,
      render: (_: unknown, item: TransferCartItem) => (
        <span className="num u-inline-block u-fs-13 u-fw-700 u-whitespace-nowrap" >
          <MoneyDisplay amount={item.quantity * item.unitCostUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 32,
      render: (_: unknown, item: TransferCartItem) => (
        <Button size="small" type="text" danger icon={<i className="icons-trash icon-size-18" />} onClick={() => onRemoveItem(item._key)} />
      ),
    },
  ]
}
