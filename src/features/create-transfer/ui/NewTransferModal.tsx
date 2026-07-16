import { useEffect, useMemo, useState } from 'react';
import { Button, Select, InputNumber, Input, Empty, Table } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useCreateTransfer } from '@/entities/transfer';
import { useInventoryRecords } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import { AppModal, EllipsisText, MoneyDisplay, SelectLoadingContent } from '@/shared/ui';
import { type Product } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';
import { getProductPriceUzs } from '@/shared/lib/productPricing';
import { blockAutofill } from '@/shared/lib/autofill';

interface NewTransferModalProps {
  open: boolean;
  onClose: () => void;
}

interface CartItem {
  _key: string;
  productId: string;
  product: Product;
  quantity: number;
  unitCostUzs: number;
}

const MIN_QTY = 1;

export function NewTransferModal({ open, onClose }: NewTransferModalProps) {
  const t = useT();
  const { isSuper, branchId: userBranchId } = useCurrentUser();
  const exchangeRate = useUIStore((s) => s.exchangeRate);
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1;
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: products = [], isLoading: productsLoading } = useProducts({ isActive: true });
  const createTransfer = useCreateTransfer();

  const defaultFromBranchId = useMemo(() => {
    const mainBranch = branches.find((b) => /main|asosiy|глав/i.test(b.name));
    const firstBranch = [...branches].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    })[0];
    return mainBranch?.id ?? firstBranch?.id;
  }, [branches]);

  const [fromBranchId, setFromBranchId] = useState<string | undefined>(
    isSuper ? undefined : (userBranchId ?? undefined),
  );
  const [toBranchId, setToBranchId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const sourceBranchId = isSuper ? fromBranchId : (userBranchId ?? undefined);
  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useInventoryRecords(
    sourceBranchId ? { branchId: sourceBranchId } : undefined,
    { enabled: Boolean(sourceBranchId) },
  );
  const productSelectLoading = Boolean(sourceBranchId) && (productsLoading || inventoryLoading);

  useEffect(() => {
    if (isSuper && open && defaultFromBranchId && !fromBranchId) {
      setFromBranchId(defaultFromBranchId);
    }
    if (!isSuper) {
      setFromBranchId(userBranchId ?? undefined);
    }
  }, [defaultFromBranchId, fromBranchId, isSuper, open, userBranchId]);

  useEffect(() => {
    if (sourceBranchId && toBranchId === sourceBranchId) {
      setToBranchId(undefined);
    }
  }, [sourceBranchId, toBranchId]);

  const stockByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const record of inventoryRecords) {
      map.set(record.product.id, Math.max(0, Math.floor(record.quantity)));
    }
    return map;
  }, [inventoryRecords]);

  const transferableProducts = useMemo(
    () => products.filter((p) => p.isActive && (stockByProductId.get(p.id) ?? 0) > 0),
    [products, stockByProductId],
  );

  const availableFrom = branches.filter((b) => b.id !== toBranchId);
  const availableTo = branches.filter((b) => b.id !== sourceBranchId);

  const handleFromBranchChange = (branchId: string) => {
    setFromBranchId(branchId);
    if (toBranchId === branchId) setToBranchId(undefined);
    setCart([]);
  };

  const addProduct = (productId: string) => {
    const product = transferableProducts.find((p) => p.id === productId);
    if (!product) return;
    const stock = stockByProductId.get(productId) ?? 0;
    if (stock <= 0) return;
    setCart((prev) => {
      if (prev.find((i) => i.productId === productId)) return prev;
      return [
        ...prev,
        {
          _key: `${productId}-${Date.now()}`,
          productId,
          product,
          quantity: Math.min(MIN_QTY, stock),
          unitCostUzs: getProductPriceUzs(product, 'wholesale', effectiveExchangeRate),
        },
      ];
    });
  };

  const clampQty = (value: number, max: number) => {
    const integerValue = Math.floor(Number.isFinite(value) ? value : MIN_QTY);
    return Math.min(Math.max(integerValue, MIN_QTY), Math.max(max, MIN_QTY));
  };

  const updateItem = (key: string, patch: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const stock = stockByProductId.get(i.productId) ?? 0;
        const quantity = patch.quantity == null
          ? i.quantity
          : clampQty(patch.quantity, stock);
        return { ...i, ...patch, quantity };
      }),
    );
  };

  const changeQty = (key: string, delta: number) => {
    const item = cart.find((i) => i._key === key);
    if (!item) return;
    updateItem(key, { quantity: item.quantity + delta });
  };

  const updateQty = (key: string, quantity: number | null) =>
    updateItem(key, { quantity: quantity == null ? MIN_QTY : quantity });

  const removeItem = (key: string) => setCart((prev) => prev.filter((i) => i._key !== key));

  const totalCost = cart.reduce((sum, i) => sum + i.quantity * i.unitCostUzs, 0);
  const hasValidQuantities = cart.every((i) => {
    const stock = stockByProductId.get(i.productId) ?? 0;
    return i.quantity >= MIN_QTY && i.quantity <= stock;
  });

  const canSubmit =
    cart.length > 0 &&
    hasValidQuantities &&
    toBranchId !== undefined &&
    toBranchId !== sourceBranchId &&
    (isSuper ? fromBranchId !== undefined : Boolean(userBranchId));

  const handleSubmit = () => {
    createTransfer.mutate(
      {
        fromBranchId: isSuper ? fromBranchId : undefined,
        toBranchId: toBranchId!,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCostUzs: i.unitCostUzs,
        })),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setCart([]);
          setToBranchId(undefined);
          if (isSuper) setFromBranchId(defaultFromBranchId);
          setNote('');
          onClose();
        },
      },
    );
  };

  return (
    <AppModal
      title={t('transferModal.title')}
      open={open}
      onClose={onClose}
      width={920}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={createTransfer.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createTransfer.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {t('transferModal.submitBtn')} ({cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          <div>
            <Label>{t('transferModal.labelFrom')}</Label>
            {isSuper ? (
              <Select
                value={fromBranchId}
                onChange={handleFromBranchChange}
                placeholder={t('transferModal.placeholderBranch')}
                style={{ width: '100%' }}
                loading={branchesLoading}
                notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                options={availableFrom.map((b) => ({ value: b.id, label: b.name }))}
              />
            ) : (
              <div style={{ padding: '5px 11px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 13 }}>
                {branches.find((b) => b.id === userBranchId)?.name ?? t('transferModal.yourBranch')}
              </div>
            )}
          </div>
          <div>
            <Label>{t('transferModal.labelTo')}</Label>
            <Select
              value={toBranchId}
              onChange={setToBranchId}
              placeholder={t('transferModal.placeholderBranch')}
              style={{ width: '100%' }}
              loading={branchesLoading}
              notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
              options={availableTo.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
        </div>

        <div>
          <Label>{t('transferModal.labelAddProduct')}</Label>
          <Select
            showSearch
            optionFilterProp="searchText"
            onChange={addProduct}
            value={null}
            placeholder={t('transferModal.placeholderSearch')}
            style={{ width: '100%' }}
            loading={productSelectLoading}
            suffixIcon={productSelectLoading ? undefined : <PlusOutlined />}
            disabled={!sourceBranchId}
            notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
            options={transferableProducts
              .filter((p) => p.isActive && !cart.find((i) => i.productId === p.id))
              .map((p) => {
                const stock = stockByProductId.get(p.id) ?? 0;
                return {
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
                      <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink-3)' }}>
                        {t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${p.unit}`)}
                      </span>
                    </div>
                  ),
                };
              })}
          />
        </div>

        {cart.length === 0 ? (
          <Empty
            description={t('transferModal.emptyCart')}
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
                  title: t('transferModal.colProduct'),
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
                  title: t('transferModal.colQty'),
                  key: 'qty',
                  width: 220,
                  render: (_, item) => {
                    const stock = stockByProductId.get(item.productId) ?? 0;
                    return (
                      <QuantityStepper
                        value={item.quantity}
                        max={stock}
                        unitLabel={t(`units.${item.product.unit}`)}
                        onMinus={() => changeQty(item._key, -1)}
                        onPlus={() => changeQty(item._key, 1)}
                        onChange={(value) => updateQty(item._key, value)}
                      />
                    );
                  },
                },
                {
                  title: t('transferModal.colStock'),
                  key: 'stock',
                  width: 140,
                  align: 'right',
                  render: (_, item) => {
                    const stock = stockByProductId.get(item.productId) ?? 0;
                    const remainingStock = Math.max(0, stock - item.quantity);
                    return (
                      <span className="num" style={{ fontWeight: 700, fontSize: 12 }}>
                        {remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                      </span>
                    );
                  },
                },
                {
                  title: t('transferModal.colCost'),
                  key: 'cost',
                  width: 170,
                  render: (_, item) => (
                    <InputNumber
                      value={item.unitCostUzs}
                      onChange={(v) => updateItem(item._key, { unitCostUzs: v ?? 0 })}
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                    />
                  ),
                },
                {
                  title: t('transferModal.colTotal'),
                  key: 'total',
                  width: 150,
                  align: 'right',
                  render: (_, item) => (
                    <span className="num" style={{ display: 'inline-block', maxWidth: 140, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <MoneyDisplay amount={item.quantity * item.unitCostUzs} currency="UZS" compact />
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
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('transferModal.totalCostLabel')}</span>
              <span className="num" style={{ display: 'inline-block', maxWidth: 180, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <MoneyDisplay amount={totalCost} currency="UZS" compact />
              </span>
            </div>
          </>
        )}

        <div>
          <Label>{t('transferModal.labelNote')}</Label>
          <Input.TextArea
            {...blockAutofill('akfa-transfer-note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={t('transferModal.placeholderNote')}
            maxLength={500}
          />
        </div>
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
  max,
  unitLabel,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number;
  max: number;
  unitLabel: string;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number | null) => void;
}) {
  const effectiveMax = Math.max(max, MIN_QTY);

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
        min={MIN_QTY}
        max={effectiveMax}
        step={1}
        precision={0}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={onPlus}
        disabled={value >= effectiveMax}
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
