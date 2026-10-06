import type { StoreTranslator } from '@store/store-i18n'

import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import type { Product } from '@store/store-stub'
import { AuthenticatedProductImage } from '../../images/AuthenticatedProductImage'

interface ProductPickerColumnsOptions {
  t: StoreTranslator
  stockByProductId?: Map<string, number>
  addedProductIds: Set<string>
  requireStock: boolean
}

export function createProductPickerColumns({ t, stockByProductId, addedProductIds, requireStock }: ProductPickerColumnsOptions): ColumnDef<Product>[] {
  //
  const columns: ColumnDef<Product>[] = [
    {
      title: t('stockIn.colProduct'),
      key: 'product',
      render: (_: unknown, product: Product) => (
        <div className="u-items-center u-flex u-gap-9 u-min-w-0">
          <AuthenticatedProductImage url={product.primaryThumbnailUrl ?? product.primaryImageUrl} alt={product.name} width={34} height={34} />
          <div className="u-min-w-0">
            <div className="u-fw-600 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{product.name}</div>
            {product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{product.sku}</div> : null}
          </div>
        </div>
      ),
    },
    {
      title: t('nav.categories'),
      key: 'category',
      width: 160,
      responsiveHide: true,
      render: (_: unknown, product: Product) =>
        product.category ? <span className="u-text-muted u-fs-12">{product.category.name}</span> : <span className="u-text-quiet">—</span>,
    },
  ]

  if (stockByProductId) {
    columns.push({
      title: t('newSale.availableStock'),
      key: 'stock',
      width: 130,
      align: 'right',
      render: (_: unknown, product: Product) => {
        //
        const stock = stockByProductId.get(product.id) ?? 0
        const tone = requireStock && stock <= 0 ? 'u-text-danger' : 'u-text-secondary'
        return <span className={`num u-fs-12 ${tone}`}>{stock.toLocaleString('ru-RU')} {t(`units.${product.unit}`)}</span>
      },
    })
  }

  columns.push({
    title: '',
    key: 'state',
    width: 110,
    align: 'right',
    render: (_: unknown, product: Product) =>
      addedProductIds.has(product.id) ? <StatusBadge tone="info">{t('productPicker.alreadyAdded')}</StatusBadge> : null,
  })

  return columns
}
