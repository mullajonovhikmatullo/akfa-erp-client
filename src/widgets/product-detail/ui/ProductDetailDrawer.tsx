import { Drawer, Skeleton, Tag, Divider } from 'antd';
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useProductInventory } from '@/entities/product';
import { StatusBadge, MoneyDisplay } from '@/shared/ui';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { Product } from '@/shared/types/domain';

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailDrawer({ product, onClose }: ProductDetailDrawerProps) {
  const { data: inventory = [], isLoading: stockLoading } = useProductInventory(
    product?.id ?? null,
  );

  return (
    <Drawer
      title={null}
      open={Boolean(product)}
      onClose={onClose}
      width={500}
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      {product && (
        <>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            {product.sku && (
              <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                {product.sku}
              </div>
            )}
            <h2 style={{ margin: '6px 0 4px', fontSize: 20, letterSpacing: '-0.01em' }}>
              {product.name}
            </h2>
            {product.description && (
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 8px' }}>
                {product.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <StatusBadge tone="info">{product.category.name}</StatusBadge>
              <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[product.unit]}</StatusBadge>
              {product.isActive ? (
                <StatusBadge tone="success" dot>Faol</StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>Nofaol</StatusBadge>
              )}
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>

            {/* Pricing */}
            <SectionLabel>Narxlar</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <PriceBox label="Chakana (so'm)" amount={product.retailPriceUzs} currency="UZS" />
              <PriceBox label="Ulgurji (so'm)" amount={product.wholesalePriceUzs} currency="UZS" />
              {product.retailPriceUsd != null && (
                <PriceBox label="Chakana (USD)" amount={product.retailPriceUsd} currency="USD" />
              )}
              {product.wholesalePriceUsd != null && (
                <PriceBox label="Ulgurji (USD)" amount={product.wholesalePriceUsd} currency="USD" />
              )}
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Stock by branch */}
            <SectionLabel>Filiallar bo'yicha qoldiq</SectionLabel>
            {stockLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : inventory.length === 0 ? (
              <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                Hali qoldiq ma'lumoti yo'q
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inventory.map((inv) => (
                  <div
                    key={inv.id}
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
                    <span style={{ fontWeight: 500 }}>{inv.branch.name}</span>
                    <span className="num" style={{ fontWeight: 700 }}>
                      {inv.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[product.unit]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function PriceBox({ label, amount, currency }: { label: string; amount: number; currency: 'UZS' | 'USD' }) {
  return (
    <div style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
        <MoneyDisplay amount={amount} currency={currency} />
      </div>
    </div>
  );
}
