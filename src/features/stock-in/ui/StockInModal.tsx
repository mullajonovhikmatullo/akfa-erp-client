import { useEffect, useMemo, useState } from 'react';
import { Button, Select, InputNumber, Empty, Table } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useStockInBatch } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import { AppModal, EllipsisText, MoneyDisplay, SelectLoadingContent } from '@/shared/ui';
import type { Product } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';
import { getProductPrice, getProductPriceUzs } from '@/shared/lib/productPricing';

interface StockInModalProps {
  open: boolean;
  onClose: () => void;
}

interface CartItem {
  _key: string;
  productId: string;
  product: Product;
  quantity: number;
  costPriceUzs: number;
  costPriceUsd?: number;
}

const MIN_QTY = 1;

export function StockInModal({ open, onClose }: StockInModalProps) {
  const t = useT();
  const { isSuper, branchId: userBranchId } = useCurrentUser();
  const exchangeRate = useUIStore((s) => s.exchangeRate);
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1;
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: products = [], isLoading: productsLoading } = useProducts({ isActive: true });
  const stockInBatch = useStockInBatch();

  const defaultBranchId = useMemo(() => {
    const mainBranch = branches.find((b) => /main|asosiy|глав/i.test(b.name));
    const firstBranch = [...branches].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    })[0];
    return mainBranch?.id ?? firstBranch?.id;
  }, [branches]);

  const [branchId, setBranchId] = useState<string | undefined>(
    isSuper ? undefined : (userBranchId ?? undefined),
  );
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isSuper && open && defaultBranchId && !branchId) {
      setBranchId(defaultBranchId);
    }
    if (!isSuper) {
      setBranchId(userBranchId ?? undefined);
    }
  }, [branchId, defaultBranchId, isSuper, open, userBranchId]);

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const costPrice = getProductPrice(product, 'cost');
    setCart((prev) => {
      if (prev.find((i) => i.productId === productId)) return prev;
      return [
        ...prev,
        {
          _key: `${productId}-${Date.now()}`,
          productId,
          product,
          quantity: 1,
          costPriceUzs: getProductPriceUzs(product, 'cost', effectiveExchangeRate),
          costPriceUsd: costPrice.currency === 'USD' ? costPrice.amount : undefined,
        },
      ];
    });
  };

  const updateItem = (key: string, patch: Partial<CartItem>) =>
    setCart((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));

  const updateQty = (key: string, quantity: number | null) =>
    updateItem(key, { quantity: quantity == null ? 0 : Math.max(quantity, 0) });

  const changeQty = (key: string, delta: number) => {
    const item = cart.find((i) => i._key === key);
    if (!item) return;
    const current = Math.max(item.quantity, 0);
    updateQty(key, delta < 0 ? Math.max(current + delta, MIN_QTY) : current + delta);
  };

  const removeItem = (key: string) =>
    setCart((prev) => prev.filter((i) => i._key !== key));

  const totalCost = cart.reduce((sum, i) => sum + Math.max(i.quantity, 0) * i.costPriceUzs, 0);
  const hasValidQuantities = cart.every((i) => i.quantity >= MIN_QTY);
  const canSubmit = cart.length > 0 && hasValidQuantities && (isSuper ? !!branchId : !!userBranchId);

  const handleSubmit = () => {
    stockInBatch.mutate(
      cart.map((i) => ({
        branchId: isSuper ? branchId : undefined,
        productId: i.productId,
        quantity: Math.max(i.quantity, MIN_QTY),
        costPriceUzs: i.costPriceUzs,
        costPriceUsd: i.costPriceUsd,
      })),
      {
        onSuccess: () => {
          setCart([]);
          if (isSuper) setBranchId(defaultBranchId);
          onClose();
        },
      },
    );
  };

  return (
    <AppModal
      title={t('stockIn.title')}
      open={open}
      onClose={onClose}
      width={920}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={stockInBatch.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={stockInBatch.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {t('stockIn.confirmBtn')} ({cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Branch selector (SUPER_ADMIN only) */}
        {isSuper && (
          <div>
            <Label>{t('stockIn.labelBranch')}</Label>
            <Select
              value={branchId}
              onChange={setBranchId}
              placeholder={t('stockIn.placeholderBranch')}
              style={{ width: 280 }}
              loading={branchesLoading}
              notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
        )}

        {/* Product search */}
        <div>
          <Label>{t('stockIn.labelAddProduct')}</Label>
          <Select
            showSearch
            optionFilterProp="searchText"
            onChange={addProduct}
            value={null}
            placeholder={t('stockIn.placeholderSearch')}
            style={{ width: '100%' }}
            loading={productsLoading}
            suffixIcon={productsLoading ? undefined : <PlusOutlined />}
            notFoundContent={productsLoading ? <SelectLoadingContent /> : undefined}
            options={products
              .filter((p) => p.isActive && !cart.find((i) => i.productId === p.id))
              .map((p) => ({
                value: p.id,
                searchText: [p.sku, p.name].filter(Boolean).join(' '),
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {p.sku && (
                      <span
                        className="num"
                        style={{
                          display: 'inline-block',
                          flexShrink: 0,
                          maxWidth: 88,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 11,
                          color: 'var(--ink-3)',
                        }}
                      >
                        {p.sku}
                      </span>
                    )}
                    <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 600 }}>
                      <EllipsisText maxWidth="100%">{p.name}</EllipsisText>
                    </span>
                  </div>
                ),
              }))}
          />
        </div>

        {/* Cart table */}
        {cart.length === 0 ? (
          <Empty
            description={t('stockIn.emptyCart')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '16px 0' }}
          />
        ) : (
          <>
            <Table
              size="small"
              pagination={false}
              rowKey="_key"
              dataSource={cart}
              scroll={{ x: 860 }}
              columns={[
                {
                  title: t('stockIn.colProduct'),
                  key: 'product',
                  width: 270,
                  render: (_, item) => (
                    <div style={{ minWidth: 0, maxWidth: 270 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                        <EllipsisText maxWidth="100%">{item.product.name}</EllipsisText>
                      </div>
                      {item.product.sku && (
                        <div
                          className="num"
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.product.sku}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: t('stockIn.colQty'),
                  key: 'qty',
                  width: 220,
                  render: (_, item) => (
                    <QuantityStepper
                      value={item.quantity}
                      unitLabel={t(`units.${item.product.unit}`)}
                      onMinus={() => changeQty(item._key, -1)}
                      onPlus={() => changeQty(item._key, 1)}
                      onChange={(value) => updateQty(item._key, value)}
                    />
                  ),
                },
                {
                  title: t('stockIn.colCost'),
                  key: 'cost',
                  width: 170,
                  render: (_, item) => (
                    <InputNumber
                      value={item.costPriceUzs}
                      onChange={(v) => updateItem(item._key, { costPriceUzs: v ?? 0, costPriceUsd: undefined })}
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                    />
                  ),
                },
                {
                  title: t('stockIn.colTotal'),
                  key: 'total',
                  width: 150,
                  align: 'right',
                  render: (_, item) => (
                    <span className="num" style={{ display: 'inline-block', maxWidth: 140, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <MoneyDisplay amount={Math.max(item.quantity, 0) * item.costPriceUzs} currency="UZS" compact />
                    </span>
                  ),
                },
                {
                  title: '',
                  key: 'del',
                  width: 32,
                  render: (_, item) => (
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(item._key)}
                    />
                  ),
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('stockIn.totalCostLabel')}</span>
              <span className="num" style={{ display: 'inline-block', maxWidth: 180, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <MoneyDisplay amount={totalCost} currency="UZS" compact />
              </span>
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {children}
    </div>
  );
}

function QuantityStepper({
  value,
  unitLabel,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number;
  unitLabel: string;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number | null) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(96px, 1fr) 30px 38px', gap: 4, alignItems: 'center' }}>
      <Button
        icon={<MinusOutlined />}
        onClick={onMinus}
        disabled={value <= MIN_QTY}
        style={{ width: 30, height: 30, padding: 0 }}
      />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(v) => onChange(v == null ? null : Number(v))}
        min={0}
        step={1}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={onPlus}
        style={{ width: 30, height: 30, padding: 0 }}
      />
      <span
        style={{
          height: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-2)',
          color: 'var(--ink-3)',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {unitLabel}
      </span>
    </div>
  );
}
