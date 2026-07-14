import { useMemo, useState } from 'react';
import { Button, Select, InputNumber, Input, Alert, Empty, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useCreateTransfer } from '@/entities/transfer';
import { useInventoryRecords } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import { AppModal, MoneyDisplay } from '@/shared/ui';
import { type Product } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';
import { getProductPriceUzs } from '@/shared/lib/productPricing';

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
  const { data: branches = [] } = useBranches();
  const { data: products = [], isLoading: productsLoading } = useProducts({ search: undefined });
  const createTransfer = useCreateTransfer();

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
  const availableTo = branches.filter((b) => b.id !== fromBranchId);

  const handleFromBranchChange = (branchId: string) => {
    setFromBranchId(branchId);
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
    return Math.min(Math.max(integerValue, MIN_QTY), max || integerValue);
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

  const removeItem = (key: string) => setCart((prev) => prev.filter((i) => i._key !== key));

  const totalCost = cart.reduce((sum, i) => sum + i.quantity * i.unitCostUzs, 0);

  const canSubmit =
    cart.length > 0 &&
    toBranchId !== undefined &&
    (isSuper ? fromBranchId !== undefined : true);

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
      width={680}
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
          {t('transferModal.submitBtn')}
        </Button>,
      ]}
    >
      {/* Branch row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <Label>{t('transferModal.labelFrom')}</Label>
          {isSuper ? (
            <Select
              value={fromBranchId}
              onChange={handleFromBranchChange}
              placeholder={t('transferModal.placeholderBranch')}
              style={{ width: '100%' }}
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
            options={availableTo.map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
      </div>

      {/* Product selector */}
      <div style={{ marginBottom: 12 }}>
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
          notFoundContent={
            productSelectLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                <Spin size="small" />
              </div>
            ) : undefined
          }
          options={transferableProducts
            .filter((p) => p.isActive && !cart.find((i) => i.productId === p.id))
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

      {/* Cart */}
      {cart.length === 0 ? (
        <Empty
          description={t('transferModal.emptyCart')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '16px 0' }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 132px 88px 128px 96px 28px', gap: 8, padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <div>{t('transferModal.colProduct')}</div><div>{t('transferModal.colQty')}</div><div style={{ textAlign: 'right' }}>{t('transferModal.colStock')}</div><div>{t('transferModal.colCost')}</div><div style={{ textAlign: 'right' }}>{t('transferModal.colTotal')}</div><div />
          </div>
          {cart.map((item) => {
            const stock = stockByProductId.get(item.productId) ?? 0;
            const remainingStock = Math.max(0, stock - item.quantity);
            return (
              <div key={item._key} style={{ display: 'grid', gridTemplateColumns: '1fr 132px 88px 128px 96px 28px', gap: 8, alignItems: 'center', padding: '7px 8px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                  {item.product.sku && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{item.product.sku}</div>
                  )}
                </div>
                <QuantityStepper
                  value={item.quantity}
                  max={stock}
                  onMinus={() => changeQty(item._key, -1)}
                  onPlus={() => changeQty(item._key, 1)}
                  onChange={(value) => updateItem(item._key, { quantity: value })}
                />
                <div className="num" style={{ textAlign: 'right', fontWeight: 700, fontSize: 12 }}>
                  {remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                </div>
                <InputNumber
                  value={item.unitCostUzs}
                  onChange={(v) => updateItem(item._key, { unitCostUzs: v ?? 0 })}
                  min={0}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                />
                <div className="num" style={{ textAlign: 'right', fontWeight: 700, fontSize: 12 }}>
                  <MoneyDisplay amount={item.quantity * item.unitCostUzs} currency="UZS" />
                </div>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item._key)} />
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('transferModal.totalCostLabel')}</span>
            <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={totalCost} currency="UZS" /></span>
          </div>
        </>
      )}

      {/* Note */}
      <div style={{ marginTop: 12 }}>
        <Label>{t('transferModal.labelNote')}</Label>
        <Input.TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={t('transferModal.placeholderNote')}
          maxLength={500}
        />
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
        disabled={value <= MIN_QTY}
        onClick={onMinus}
        style={{ width: 32, height: 32, padding: 0 }}
      />
      <InputNumber
        value={value}
        onChange={(v) => onChange(Math.floor(Number(v ?? MIN_QTY)))}
        min={MIN_QTY}
        max={max || undefined}
        step={1}
        precision={0}
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
