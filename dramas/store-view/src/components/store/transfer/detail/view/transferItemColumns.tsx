import type { StoreTranslator } from '@store/store-i18n'

import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { Transfer } from '@store/store-stub'

type TransferItem = Transfer['items'][number]

export function createTransferItemColumns(t: StoreTranslator): ColumnDef<TransferItem>[] {
  //
  return [
    {
      title: t('transfers.colProduct'),
      key: 'product',
      render: (_, item) => (
        <div className="u-min-w-0">
          <div className="u-fw-600">{item.product.name}</div>
          {item.product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{item.product.sku}</div> : null}
        </div>
      ),
    },
    {
      title: t('transfers.colQty'),
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (_, item) => (
        <span className="num u-whitespace-nowrap">
          {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
        </span>
      ),
    },
    {
      title: t('transfers.colCost'),
      key: 'unitCost',
      width: 140,
      align: 'right',
      render: (_, item) => (
        <span className="num u-whitespace-nowrap">
          <MoneyDisplay amount={item.unitCostUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('transfers.colTotal'),
      key: 'totalCost',
      width: 140,
      align: 'right',
      render: (_, item) => (
        <span className="num u-fw-700 u-whitespace-nowrap">
          <MoneyDisplay amount={item.totalCostUzs} currency="UZS" />
        </span>
      ),
    },
  ]
}
