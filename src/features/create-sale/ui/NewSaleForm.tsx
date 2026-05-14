import { useState, useId } from 'react';
import { Button, Select, InputNumber, Radio, Alert, Tooltip, Empty } from 'antd';
import { DeleteOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useCustomers } from '@/entities/customer';
import { useCreateSale } from '@/entities/sale';
import { useCurrentUser } from '@/entities/user';
import { MoneyDisplay, StatusBadge } from '@/shared/ui';
import {
  PRODUCT_UNIT_LABELS,
  PAYMENT_METHOD_LABELS,
  type SaleType,
  type PaymentMethod,
  type Product,
} from '@/shared/types/domain';

const PAYMENT_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((k) => ({
  value: k,
  label: PAYMENT_METHOD_LABELS[k],
}));

interface CartItem {
  _key: string;
  productId: string;
  product: Product;
  quantity: number;
}

export function NewSaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const { isSuper, branchId: userBranchId } = useCurrentUser();

  const { data: products = [] } = useProducts({ search: undefined });
  const { data: customers = [] } = useCustomers({ isActive: true });

  const createSale = useCreateSale();

  const [saleType, setSaleType] = useState<SaleType>('RETAIL');
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_UZS');
  const [paidAmountUzs, setPaidAmountUzs] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { _key: `${productId}-${Date.now()}`, productId, product, quantity: 1 }];
    });
    setSelectedProductId(undefined);
  };

  const updateQty = (key: string, quantity: number) => {
    setCart((prev) => prev.map((i) => (i._key === key ? { ...i, quantity } : i)));
  };

  const removeItem = (key: string) => {
    setCart((prev) => prev.filter((i) => i._key !== key));
  };

  const unitPrice = (p: Product) =>
    saleType === 'RETAIL' ? p.retailPriceUzs : p.wholesalePriceUzs;

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * unitPrice(i.product), 0);
  const debtAmount = Math.max(0, subtotal - paidAmountUzs);
  const needsCustomer = debtAmount > 0;

  const canSubmit = cart.length > 0 && (!needsCustomer || customerId);

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
            <Label>Сотув тури</Label>
            <Radio.Group
              value={saleType}
              onChange={(e) => setSaleType(e.target.value)}
              style={{ display: 'flex' }}
            >
              <Radio.Button value="RETAIL" style={{ flex: 1, textAlign: 'center' }}>Чакана</Radio.Button>
              <Radio.Button value="WHOLESALE" style={{ flex: 1, textAlign: 'center' }}>Улгуржи</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <Label>Мижоз (ихтиёрий)</Label>
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              value={customerId}
              onChange={setCustomerId}
              placeholder="Мижозни танланг"
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
            showSearch
            optionFilterProp="label"
            value={selectedProductId}
            onChange={addToCart}
            placeholder="+ Маҳсулот қидириш ва қўшиш (SKU ёки ном)"
            style={{ width: '100%' }}
            suffixIcon={<PlusOutlined />}
            options={products
              .filter((p) => p.isActive)
              .map((p) => ({
                value: p.id,
                label: [p.sku, p.name].filter(Boolean).join(' · '),
              }))}
          />
        </div>

        {/* Cart items */}
        {cart.length === 0 ? (
          <Empty
            description="Ҳали маҳсулот қўшилмади"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
          />
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px 140px 80px 28px',
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
              <div>Маҳсулот</div>
              <div>Миқдор</div>
              <div style={{ textAlign: 'right' }}>Бирлик нархи</div>
              <div style={{ textAlign: 'right' }}>Жами</div>
              <div />
            </div>

            {cart.map((item) => (
              <div
                key={item._key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px 140px 80px 28px',
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
                <InputNumber
                  value={item.quantity}
                  onChange={(v) => updateQty(item._key, v ?? 1)}
                  min={0.0001}
                  step={1}
                  style={{ width: '100%' }}
                  addonAfter={<span style={{ fontSize: 11 }}>{PRODUCT_UNIT_LABELS[item.product.unit]}</span>}
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
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Сотув хулосаси</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row label="Маҳсулотлар" value={`${cart.length} тур · ${cart.reduce((s, i) => s + i.quantity, 0).toLocaleString('ru-RU')} дона`} />
          <Row
            label="Жами сумма"
            value={<span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={subtotal} currency="UZS" /></span>}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label>Тўлов усули</Label>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={PAYMENT_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <Label>Тўланган (сўм)</Label>
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
                <span style={{ color: 'var(--ink-3)' }}>Қарз</span>
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
            message="Қарз учун мижоз танлаш керак"
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
          Сотувни тасдиқлаш
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
