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
    <Drawer rootClassName="ant-drawer-root detail-drawer--flush" title={null} open={Boolean(product)} onClose={onClose} width={540} closable={{ placement: 'end' }} destroyOnHidden>
      {displayedProduct ? (
        <>
          <ProductImageGallery
            images={displayedProduct.images}
            productName={displayedProduct.name}
            t={t}
            loading={detailLoading}
          />

          <div className="u-border-b-default u-p-20-24">
            {displayedProduct.sku ? (
              <div
                className="u-text-muted u-font-mono u-fs-11 u-tracking-wide u-text-uppercase"
              >
                {displayedProduct.sku}
              </div>
            ) : null}
            <h2 className="u-fs-18 u-m-6-0-4">{displayedProduct.name}</h2>
            {displayedProduct.description ? (
              <p className="u-text-muted u-fs-13 u-m-4-0-8">{displayedProduct.description}</p>
            ) : null}
            <div className="u-flex u-flex-wrap u-gap-8 u-mt-8">
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

          <div className="u-p-20-24">
            <SectionLabel>{t('products.drawerPricingSection')}</SectionLabel>
            <div className="u-grid u-gap-10 u-grid-cols-fit-135 u-mb-20">
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

            <Divider className="u-m-0-0-16" />

            <SectionLabel>{t('products.drawerStockSection')}</SectionLabel>
            {stockLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : inventory.length === 0 ? (
              <div className="u-text-muted u-fs-13 u-p-12-0">{t('products.drawerNoStock')}</div>
            ) : (
              <div className="u-flex u-flex-col u-gap-8">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-p-10-14"
                  >
                    <span className="u-fw-500">{item.branch.name}</span>
                    <span className="num u-fw-700" >
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
