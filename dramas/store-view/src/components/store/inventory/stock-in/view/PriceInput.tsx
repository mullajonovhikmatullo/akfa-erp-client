import { InputNumber } from 'antd'

import type { StockInCartItem } from './types'

type PriceField = 'costPrice' | 'wholesalePrice' | 'retailPrice'

interface PriceInputProps {
  item: StockInCartItem
  field: PriceField
  error: string | null
  onUpdateItem: (key: string, patch: Partial<StockInCartItem>) => void
}

const formatUzs = (value: number | string | undefined) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const parseUzs = (value: string | undefined) => Number(value?.replace(/\s/g, ''))

export function PriceInput({ item, field, error, onUpdateItem }: PriceInputProps) {
  //
  const isUsd = item.currency === 'USD'

  return (
    <div>
      <InputNumber<number>
        value={item[field]}
        onChange={(value) => onUpdateItem(item._key, { [field]: value ?? 0 })}
        min={0}
        status={error ? 'error' : undefined}
        className="u-w-full"
        {...(isUsd
          ? { step: 0.5, precision: 2, prefix: '$' }
          : { step: 1000, precision: 2, formatter: formatUzs, parser: parseUzs })}
      />
      {error ? <div className="u-text-danger u-fs-11 u-mt-4">{error}</div> : null}
    </div>
  )
}
