import { Button, Popconfirm, Tooltip } from 'antd'
import { BoxArrowDownIcon, EyeIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import { formatDate } from '@store/store-shared/lib/formatters'
import { getProductPrice } from '@store/store-shared/lib/product-pricing'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Product, ProductUnit } from '@store/store-stub'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { AuthenticatedProductImage } from '../../images/AuthenticatedProductImage'

type ProductColumnsOptions = {
  t: (key: string) => string
  rowIndex: (index: number) => number
  canManage: boolean
  deleting: boolean
  deletingId?: string
  isNewProduct: (product: Product) => boolean
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function createProductColumns({
  t,
  rowIndex,
  canManage,
  deleting,
  deletingId,
  isNewProduct,
  onView,
  onEdit,
  onDelete,
}: ProductColumnsOptions): ColumnDef<Product>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Product, index: number) => <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>,
    },
    {
      title: t('products.productCode'),
      dataIndex: 'sku',
      width: 140,
      responsiveHide: true,
      render: (value: string | null) => value ? <span className="num" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{value}</span> : <span style={{ color: 'var(--ink-4)' }}>-</span>,
    },
    {
      title: t('nav.products'),
      key: 'name',
      render: (_: unknown, product: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <AuthenticatedProductImage url={product.primaryThumbnailUrl} alt={product.name} width={42} height={42} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
              {isNewProduct(product) ? <StatusBadge tone="warning"><BoxArrowDownIcon size={12} weight="duotone" />{t('products.newBadge')}</StatusBadge> : null}
            </div>
            {product.category ? <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{product.category.name}</div> : null}
          </div>
        </div>
      ),
    },
    {
      title: t('products.colUnit'),
      dataIndex: 'unit',
      width: 90,
      responsiveHide: true,
      render: (value: ProductUnit) => <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[value]}</StatusBadge>,
    },
    {
      title: t('products.colLowStock'),
      key: 'lowStockThreshold',
      width: 125,
      responsiveHide: true,
      render: (_: unknown, product: Product) => {
        //
        const threshold = product.lowStockThreshold
        return threshold == null ? <span style={{ color: 'var(--ink-4)' }}>—</span> : <span className="num" style={{ color: 'var(--warning)', fontWeight: 600 }}>{threshold.toLocaleString('uz-UZ', { maximumFractionDigits: 4 })} {PRODUCT_UNIT_LABELS[product.unit]}</span>
      },
    },
    ...(['cost', 'wholesale', 'retail'] as const).map((priceType) => ({
      title: t(`products.col${priceType.charAt(0).toUpperCase()}${priceType.slice(1)}`),
      key: priceType,
      width: 150,
      align: 'right' as const,
      responsiveHide: priceType !== 'retail',
      render: (_: unknown, product: Product) => {
        //
        const price = getProductPrice(product, priceType)
        return <span className="num" style={{ fontWeight: priceType === 'cost' ? undefined : 600 }}><MoneyDisplay amount={price.amount} currency={price.currency} noConvert={price.currency === 'USD'} /></span>
      },
    })),
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      width: 100,
      align: 'center',
      responsiveHide: true,
      render: (value: boolean) => value ? <StatusBadge tone="success" dot>{t('common.active')}</StatusBadge> : <StatusBadge tone="danger" dot>{t('common.inactive')}</StatusBadge>,
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(value)}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, product: Product) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={t('common.view')}>
            <Button size="small" type="text" icon={<EyeIcon size={18} />} onClick={(event) => { event.stopPropagation(); onView(product) }} />
          </Tooltip>
          {canManage ? (
            <>
              <Button size="small" type="text" icon={<PencilSimpleIcon size={18} />} onClick={(event) => { event.stopPropagation(); onEdit(product) }} />
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${product.name}" ${t('products.deleteDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleting && deletingId === product.id }}
                onConfirm={(event) => { event?.stopPropagation(); onDelete(product.id) }}
                onPopupClick={(event) => event.stopPropagation()}
              >
                <Button size="small" type="text" danger icon={<TrashIcon size={18} />} loading={deleting && deletingId === product.id} onClick={(event) => event.stopPropagation()} />
              </Popconfirm>
            </>
          ) : null}
        </div>
      ),
    },
  ]
}
