import { Divider, Drawer, Skeleton } from 'antd'
import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Product } from '@store/store-stub'
import { ProductImageGallery } from '../images/ProductImageGallery'
import { useProductDetail } from '../hooks/useProductDetail'
import { useProductInventory } from '../hooks/useProductInventory'
import { PriceBox } from './view/PriceBox'
import { SectionLabel } from './view/SectionLabel'

interface ProductDetailDrawerProps {
  t: (key: string) => string
  product: Product | null
  onClose: () => void
}

export function ProductDetailDrawer({ t, product, onClose }: ProductDetailDrawerProps) {
  //
  const { data: inventory = [], isLoading: stockLoading } = useProductInventory(product?.id ?? null)
  const { data: productDetail, isLoading: detailLoading } = useProductDetail(product?.id ?? null)
  const displayedProduct = productDetail ?? product

  return (
    <Drawer rootClassName="ant-drawer-root" title={null} open={Boolean(product)} onClose={onClose} width={540} closable={{ placement: 'end' }} styles={{ body: { padding: 0 } }} destroyOnHidden>
      {displayedProduct ? (
        <>
          <ProductImageGallery
            images={displayedProduct.images}
            productName={displayedProduct.name}
            t={t}
            loading={detailLoading}
          />

          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            {displayedProduct.sku ? (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                {displayedProduct.sku}
              </div>
            ) : null}
            <h2 style={{ margin: '6px 0 4px', fontSize: 18 }}>{displayedProduct.name}</h2>
            {displayedProduct.description ? (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 8px' }}>{displayedProduct.description}</p>
            ) : null}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {displayedProduct.category ? <StatusBadge tone="info">{displayedProduct.category.name}</StatusBadge> : null}
              <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[displayedProduct.unit]}</StatusBadge>
              {displayedProduct.lowStockThreshold != null ? (
                <StatusBadge tone="warning">
                  {t('products.drawerLowStockThreshold')}: {displayedProduct.lowStockThreshold.toLocaleString('uz-UZ', { maximumFractionDigits: 4 })} {PRODUCT_UNIT_LABELS[displayedProduct.unit]}
                </StatusBadge>
              ) : null}
              {displayedProduct.isActive ? (
                <StatusBadge tone="success" dot>
                  {t('common.active')}
                </StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>
                  {t('common.inactive')}
                </StatusBadge>
              )}
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <SectionLabel>{t('products.drawerPricingSection')}</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10, marginBottom: 20 }}>
              {displayedProduct.costPriceUzs > 0 ? (
                <PriceBox label={t('products.drawerCostUzs')} amount={displayedProduct.costPriceUzs} currency="UZS" />
              ) : null}
              {displayedProduct.wholesalePriceUzs > 0 ? (
                <PriceBox label={t('products.drawerWholesaleUzs')} amount={displayedProduct.wholesalePriceUzs} currency="UZS" />
              ) : null}
              {displayedProduct.retailPriceUzs > 0 ? (
                <PriceBox label={t('products.drawerRetailUzs')} amount={displayedProduct.retailPriceUzs} currency="UZS" />
              ) : null}
              {displayedProduct.costPriceUsd != null ? (
                <PriceBox label={t('products.drawerCostUsd')} amount={displayedProduct.costPriceUsd} currency="USD" />
              ) : null}
              {displayedProduct.wholesalePriceUsd != null ? (
                <PriceBox label={t('products.drawerWholesaleUsd')} amount={displayedProduct.wholesalePriceUsd} currency="USD" />
              ) : null}
              {displayedProduct.retailPriceUsd != null ? (
                <PriceBox label={t('products.drawerRetailUsd')} amount={displayedProduct.retailPriceUsd} currency="USD" />
              ) : null}
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            <SectionLabel>{t('products.drawerStockSection')}</SectionLabel>
            {stockLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : inventory.length === 0 ? (
              <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>{t('products.drawerNoStock')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--surface-2)',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.branch.name}</span>
                    <span className="num" style={{ fontWeight: 700 }}>
                      {item.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[displayedProduct.unit]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </Drawer>
  )
}
