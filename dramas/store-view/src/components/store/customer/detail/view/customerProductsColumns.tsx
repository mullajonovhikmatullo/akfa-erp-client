import type { StoreTranslator } from '@store/store-i18n'
import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { CustomerPurchasedProduct } from '@store/store-stub'
import { AuthenticatedProductImage } from '../../../product/images/AuthenticatedProductImage'
import { formatInventoryQuantity } from '../../../inventory/lib/inventory-rows'

interface CustomerProductsColumnsOptions {
  t: StoreTranslator
  rowIndex: (index: number) => number
}

export function createCustomerProductsColumns({ t, rowIndex }: CustomerProductsColumnsOptions): ColumnDef<CustomerPurchasedProduct>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 48,
      render: (_: unknown, __: CustomerPurchasedProduct, index: number) => <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>,
    },
    {
      title: t('inventory.product'),
      key: 'product',
      render: (_: unknown, row: CustomerPurchasedProduct) => (
        <div className="u-items-center u-flex u-gap-9 u-min-w-0">
          <AuthenticatedProductImage url={row.primaryThumbnailUrl} alt={row.name} width={40} height={40} />
          <div className="u-min-w-0">
            <div className="u-fw-600 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{row.name}</div>
            <div className="u-text-muted u-font-mono u-fs-11">{row.sku || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('customerDetail.colQuantity'),
      key: 'quantity',
      width: 150,
      align: 'right',
      render: (_: unknown, row: CustomerPurchasedProduct) => (
        <span className="num">{formatInventoryQuantity(row.quantity)} <span className="u-text-muted u-fs-11">{t(`units.${row.unit}`)}</span></span>
      ),
    },
    {
      title: t('customerDetail.colSpent'),
      key: 'total',
      width: 160,
      align: 'right',
      render: (_: unknown, row: CustomerPurchasedProduct) => <span className="num u-fw-700"><MoneyDisplay amount={row.totalAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('customerDetail.colPurchaseCount'),
      key: 'purchaseCount',
      width: 120,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, row: CustomerPurchasedProduct) => <span className="num u-text-muted">{row.purchaseCount} {t('common.countSuffix')}</span>,
    },
    {
      title: t('customerDetail.colLastPurchase'),
      key: 'lastPurchasedAt',
      width: 130,
      responsiveHide: true,
      render: (_: unknown, row: CustomerPurchasedProduct) => <span className="u-text-muted u-fs-12">{formatDate(row.lastPurchasedAt)}</span>,
    },
  ]
}
