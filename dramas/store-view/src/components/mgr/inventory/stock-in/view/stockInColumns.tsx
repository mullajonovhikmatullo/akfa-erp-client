import { Button, InputNumber } from 'antd'
import { TrashIcon } from '@phosphor-icons/react'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { QuantityStepper } from './QuantityStepper'
import type { StockInCartItem } from './types'

interface StockInColumnsOptions {
  t: (key: string) => string
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
      width: 270,
      render: (_: unknown, item: StockInCartItem) => (
        <div style={{ minWidth: 0, maxWidth: 270 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
            <EllipsisText maxWidth="100%">{item.product.name}</EllipsisText>
          </div>
          {item.product.sku ? (
            <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.product.sku}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('stockIn.colQty'),
      key: 'qty',
      width: 220,
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
      title: t('stockIn.colCost'),
      key: 'cost',
      width: 170,
      render: (_: unknown, item: StockInCartItem) => (
        <InputNumber<number>
          value={item.costPriceUzs}
          onChange={(value) => onUpdateItem(item._key, { costPriceUzs: value ?? 0, costPriceUsd: undefined })}
          min={0}
          step={1000}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          parser={(value) => Number(value?.replace(/\s/g, ''))}
        />
      ),
    },
    {
      title: t('stockIn.colTotal'),
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (_: unknown, item: StockInCartItem) => (
        <span className="num" style={{ display: 'inline-block', maxWidth: 140, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <MoneyDisplay amount={Math.max(item.quantity, 0) * item.costPriceUzs} currency="UZS" compact />
        </span>
      ),
    },
    {
      title: '',
      key: 'del',
      width: 32,
      render: (_: unknown, item: StockInCartItem) => (
        <Button size="small" type="text" danger icon={<TrashIcon size={18} />} onClick={() => onRemoveItem(item._key)} />
      ),
    },
  ]
}
