import { Divider, Drawer, Skeleton } from 'antd'
import type { ReactNode } from 'react'
import { PRODUCT_UNIT_LABELS } from '@erp/erp-shared/core'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { Currency, Product } from '@erp/store-buddy-stub'
import { useProductInventory } from '../hooks/useProducts'

interface ProductDetailDrawerProps {
  t: (key: string) => string
  product: Product | null
  onClose: () => void
}

export function ProductDetailDrawer({ t, product, onClose }: ProductDetailDrawerProps) {
  //
  const { data: inventory = [], isLoading: stockLoading } = useProductInventory(product?.id ?? null)

  return (
    <Drawer title={null} open={Boolean(product)} onClose={onClose} width={500} styles={{ body: { padding: 0 } }} destroyOnHidden>
      {product ? (
        <>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            {product.sku ? (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                {product.sku}
              </div>
            ) : null}
            <h2 style={{ margin: '6px 0 4px', fontSize: 20, letterSpacing: '-0.01em' }}>{product.name}</h2>
            {product.description ? <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 8px' }}>{product.description}</p> : null}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {product.category ? <StatusBadge tone="info">{product.category.name}</StatusBadge> : null}
              <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[product.unit]}</StatusBadge>
              {product.isActive ? (
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
              {product.costPriceUzs > 0 ? <PriceBox label={t('products.drawerCostUzs')} amount={product.costPriceUzs} currency="UZS" /> : null}
              {product.wholesalePriceUzs > 0 ? (
                <PriceBox label={t('products.drawerWholesaleUzs')} amount={product.wholesalePriceUzs} currency="UZS" />
              ) : null}
              {product.retailPriceUzs > 0 ? <PriceBox label={t('products.drawerRetailUzs')} amount={product.retailPriceUzs} currency="UZS" /> : null}
              {product.costPriceUsd != null ? <PriceBox label={t('products.drawerCostUsd')} amount={product.costPriceUsd} currency="USD" /> : null}
              {product.wholesalePriceUsd != null ? (
                <PriceBox label={t('products.drawerWholesaleUsd')} amount={product.wholesalePriceUsd} currency="USD" />
              ) : null}
              {product.retailPriceUsd != null ? <PriceBox label={t('products.drawerRetailUsd')} amount={product.retailPriceUsd} currency="USD" /> : null}
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
                      {item.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[product.unit]}
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

function SectionLabel({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function PriceBox({ label, amount, currency }: { label: string; amount: number; currency: Currency }) {
  //
  return (
    <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
        <MoneyDisplay amount={amount} currency={currency} noConvert />
      </div>
    </div>
  )
}
