import { useEffect, useMemo, useState } from 'react';
import { Button, Select, InputNumber, Radio, Alert, Tooltip, Empty } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, CheckOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useCustomers } from '@/entities/customer';
import { useCreateSale } from '@/entities/sale';
import { useStockBatches } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { MoneyDisplay } from '@/shared/ui';
import {
  PAYMENT_METHOD_LABELS,
  type SaleType,
  type PaymentMethod,
  type Product,
} from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';

interface CartItem {
  _key: string;
  productId: string;
  product: Product;
  quantity: number;
}

const MIN_QTY = 0.0001;

export function NewSaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useT();
  const { branchId: userBranchId } = useCurrentUser();

  const branchFilter = userBranchId ?? undefined;
  const { data: products = [] } = useProducts({ isActive: true });
  const { data: batches = [] } = useStockBatches(
    branchFilter ? { branchId: branchFilter, depleted: false } : undefined,
    { enabled: Boolean(branchFilter) },
  );
  const { data: customers = [] } = useCustomers({
    isActive: true,
    ...(branchFilter ? { branchId: branchFilter } : {}),
  });

  const createSale = useCreateSale();

  const [saleType, setSaleType] = useState<SaleType>('RETAIL');
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_UZS');
  const [paidAmountUzs, setPaidAmountUzs] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [productSelectKey, setProductSelectKey] = useState(0);

  const stockByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const batch of batches) {
      const current = map.get(batch.product.id) ?? 0;
      map.set(batch.product.id, current + batch.remainingQty);
    }
    return map;
  }, [batches]);

  const sellableProducts = useMemo(
    () => products.filter((p) => p.isActive && (stockByProductId.get(p.id) ?? 0) > 0),
    [products, stockByProductId],
  );
  const selectedProductIds = useMemo(() => new Set(cart.map((item) => item.productId)), [cart]);

  const PAYMENT_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((k) => ({
    value: k,
    label: PAYMENT_METHOD_LABELS[k],
  }));

  const addToCart = (productId: string) => {
    const product = sellableProducts.find((p) => p.id === productId);
    if (!product) return;
    const stock = stockByProductId.get(productId) ?? 0;
    if (stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev;
      }
      return [...prev, { _key: `${productId}-${Date.now()}`, productId, product, quantity: Math.min(1, stock) }];
    });
    setSelectedProductId(undefined);
    setProductSelectKey((key) => key + 1);
  };

  const updateQty = (key: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const stock = stockByProductId.get(i.productId) ?? 0;
        return { ...i, quantity: Math.min(Math.max(quantity, MIN_QTY), stock) };
      }),
    );
  };

  const changeQty = (key: string, delta: number) => {
    const item = cart.find((i) => i._key === key);
    if (!item) return;
    if (delta < 0 && item.quantity <= 1) {
      removeItem(key);
      return;
    }
    updateQty(key, item.quantity + delta);
  };

  const removeItem = (key: string) => {
    setCart((prev) => prev.filter((i) => i._key !== key));
    setSelectedProductId(undefined);
    setProductSelectKey((current) => current + 1);
  };

  const unitPrice = (p: Product) =>
    saleType === 'RETAIL' ? p.retailPriceUzs : p.wholesalePriceUzs;

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * unitPrice(i.product), 0);
  const debtAmount = Math.max(0, subtotal - paidAmountUzs);
  const needsCustomer = debtAmount > 0;
  const fullPaidAmount = Number(subtotal.toFixed(2));

  const canSubmit = Boolean(userBranchId) && cart.length > 0 && (!needsCustomer || customerId);

  useEffect(() => {
    setPaidAmountUzs((current) => (current > fullPaidAmount ? fullPaidAmount : current));
  }, [fullPaidAmount]);

  const handleSubmit = () => {
    createSale.mutate(
      {
        saleType,
        customerId: customerId || undefined,
        paymentMethod,
        paidAmountUzs,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
      {
        onSuccess: () => {
          setCart([]);
          setPaidAmountUzs(0);
          setCustomerId(undefined);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>

      {/* Left: Cart */}
      <div className="card">

        {/* Controls row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <Label>{t('newSale.typeLabel')}</Label>
            <Radio.Group
              value={saleType}
              onChange={(e) => setSaleType(e.target.value)}
              style={{ display: 'flex' }}
            >
              <Radio.Button value="RETAIL" style={{ flex: 1, textAlign: 'center' }}>{t('sales.typeRetail')}</Radio.Button>
              <Radio.Button value="WHOLESALE" style={{ flex: 1, textAlign: 'center' }}>{t('sales.typeWholesale')}</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <Label>{t('newSale.customerOptional')}</Label>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              value={customerId}
              onChange={setCustomerId}
              placeholder={t('newSale.customerPlaceholder')}
              style={{ width: '100%' }}
              options={customers.map((c) => ({
                value: c.id,
                label: c.phone ? `${c.fullName} · ${c.phone}` : c.fullName,
              }))}
            />
          </div>
        </div>

        {/* Product selector */}
        <div style={{ marginBottom: 14 }}>
          <Select
            key={productSelectKey}
            showSearch
            optionFilterProp="searchText"
            value={selectedProductId}
            onChange={addToCart}
            placeholder={t('newSale.productSearchPlaceholder')}
            style={{ width: '100%' }}
            suffixIcon={<PlusOutlined />}
            options={sellableProducts
              .filter((p) => !selectedProductIds.has(p.id))
              .map((p) => {
                const stock = stockByProductId.get(p.id) ?? 0;
                return {
                  value: p.id,
                  searchText: [p.sku, p.name].filter(Boolean).join(' '),
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        {p.sku && (
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                            {p.sku}
                          </div>
                        )}
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink-3)' }}>
                        {t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${p.unit}`)}
                      </span>
                    </div>
                  ),
                };
              })}
          />
        </div>

        {/* Cart items */}
        {cart.length === 0 ? (
          <Empty
            description={t('newSale.emptyCart')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
          />
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 132px 130px 80px 28px',
                gap: 8,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                borderBottom: '1px solid var(--border)',
                marginBottom: 6,
              }}
            >
              <div>{t('newSale.colProduct')}</div>
              <div>{t('newSale.colQty')}</div>
              <div style={{ textAlign: 'right' }}>{t('newSale.colUnitPrice')}</div>
              <div style={{ textAlign: 'right' }}>{t('newSale.colTotal')}</div>
              <div />
            </div>

            {cart.map((item) => (
              <div
                key={item._key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 132px 130px 80px 28px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                  {item.product.sku && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                      {item.product.sku}
                    </div>
                  )}
                </div>
                <QuantityStepper
                  value={item.quantity}
                  max={stockByProductId.get(item.productId) ?? 0}
                  onMinus={() => changeQty(item._key, -1)}
                  onPlus={() => changeQty(item._key, 1)}
                  onChange={(value) => updateQty(item._key, value)}
                />
                <div className="num" style={{ textAlign: 'right', fontSize: 13 }}>
                  <MoneyDisplay amount={unitPrice(item.product)} currency="UZS" />
                </div>
                <div className="num" style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>
                  <MoneyDisplay amount={item.quantity * unitPrice(item.product)} currency="UZS" />
                </div>
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(item._key)}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Right: Summary */}
      <div className="card" style={{ position: 'sticky', top: 76 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('newSale.summary')}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row
            label={t('newSale.rowProducts')}
            value={`${cart.length} ${t('newSale.typeSuffix')} · ${cart.reduce((s, i) => s + i.quantity, 0).toLocaleString('ru-RU')} ${t('newSale.qtySuffix')}`}
          />
          <Row
            label={t('newSale.rowTotal')}
            value={<span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={subtotal} currency="UZS" /></span>}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label>{t('newSale.paymentMethod')}</Label>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={PAYMENT_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <Label>{t('newSale.paidAmount')}</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <InputNumber
                value={paidAmountUzs}
                onChange={(v) => setPaidAmountUzs(v ?? 0)}
                style={{ width: '100%' }}
                min={0}
                max={subtotal}
                step={10000}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
              />
              <Tooltip title={t('newSale.markFullPaidTooltip')}>
                <Button
                  icon={<CheckCircleOutlined />}
                  disabled={fullPaidAmount <= 0 || paidAmountUzs === fullPaidAmount}
                  onClick={() => setPaidAmountUzs(fullPaidAmount)}
                >
                  {t('newSale.markFullPaid')}
                </Button>
              </Tooltip>
            </div>
          </div>

          {subtotal > 0 && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${debtAmount > 0 ? 'var(--danger)' : 'var(--success)'}`,
                background: debtAmount > 0 ? 'rgba(220,38,38,.04)' : 'rgba(22,163,74,.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--ink-3)' }}>{t('sales.drawerDebt')}</span>
                <span className="num" style={{ fontWeight: 700, color: debtAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  <MoneyDisplay amount={debtAmount} currency="UZS" />
                </span>
              </div>
            </div>
          )}
        </div>

        {needsCustomer && !customerId && (
          <Alert
            type="warning"
            showIcon
            message={t('newSale.debtNeedsCustomer')}
            style={{ marginTop: 12 }}
          />
        )}

        <Button
          type="primary"
          size="large"
          block
          icon={<CheckOutlined />}
          loading={createSale.isPending}
          disabled={!canSubmit}
          style={{ marginTop: 16 }}
          onClick={handleSubmit}
        >
          {t('newSale.confirmSale')}
        </Button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function QuantityStepper({
  value,
  max,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number;
  max: number;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px minmax(48px, 1fr) 32px', gap: 4, alignItems: 'center' }}>
      <Button
        icon={<MinusOutlined />}
        onClick={onMinus}
        style={{ width: 32, height: 32, padding: 0 }}
      />
      <InputNumber
        value={value}
        onChange={(v) => onChange(v ?? 1)}
        min={MIN_QTY}
        max={max || undefined}
        step={1}
        controls={false}
        style={{ width: '100%' }}
      />
      <Button
        icon={<PlusOutlined />}
        disabled={max > 0 && value >= max}
        onClick={onPlus}
        style={{ width: 32, height: 32, padding: 0 }}
      />
    </div>
  );
}
