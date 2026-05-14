import { useState } from 'react';
import { Button, Select, InputNumber, Input, Alert, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useCreateTransfer } from '@/entities/transfer';
import { useCurrentUser } from '@/entities/user';
import { AppModal, MoneyDisplay } from '@/shared/ui';
import { PRODUCT_UNIT_LABELS, type Product } from '@/shared/types/domain';

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

export function NewTransferModal({ open, onClose }: NewTransferModalProps) {
  const { isSuper, branchId: userBranchId } = useCurrentUser();
  const { data: branches = [] } = useBranches();
  const { data: products = [] } = useProducts({ search: undefined });
  const createTransfer = useCreateTransfer();

  const [fromBranchId, setFromBranchId] = useState<string | undefined>(
    isSuper ? undefined : (userBranchId ?? undefined),
  );
  const [toBranchId, setToBranchId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const availableFrom = branches.filter((b) => b.id !== toBranchId);
  const availableTo = branches.filter((b) => b.id !== fromBranchId);

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      if (prev.find((i) => i.productId === productId)) return prev;
      return [
        ...prev,
        {
          _key: `${productId}-${Date.now()}`,
          productId,
          product,
          quantity: 1,
          unitCostUzs: product.wholesalePriceUzs,
        },
      ];
    });
  };

  const updateItem = (key: string, patch: Partial<CartItem>) => {
    setCart((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));
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
      title="Янги трансфер"
      open={open}
      onClose={onClose}
      width={680}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={createTransfer.isPending}>
          Бекор қилиш
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createTransfer.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Трансфер яратиш
        </Button>,
      ]}
    >
      {/* Branch row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <Label>Қаердан</Label>
          {isSuper ? (
            <Select
              value={fromBranchId}
              onChange={setFromBranchId}
              placeholder="Филиал танланг"
              style={{ width: '100%' }}
              options={availableFrom.map((b) => ({ value: b.id, label: b.name }))}
            />
          ) : (
            <div style={{ padding: '5px 11px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 13 }}>
              {branches.find((b) => b.id === userBranchId)?.name ?? 'Сизнинг филиалингиз'}
            </div>
          )}
        </div>
        <div>
          <Label>Қаерга</Label>
          <Select
            value={toBranchId}
            onChange={setToBranchId}
            placeholder="Филиал танланг"
            style={{ width: '100%' }}
            options={availableTo.map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
      </div>

      {/* Product selector */}
      <div style={{ marginBottom: 12 }}>
        <Label>Маҳсулот қўшиш</Label>
        <Select
          showSearch
          optionFilterProp="label"
          onChange={addProduct}
          value={null}
          placeholder="SKU ёки ном бўйича қидириш"
          style={{ width: '100%' }}
          suffixIcon={<PlusOutlined />}
          options={products
            .filter((p) => p.isActive && !cart.find((i) => i.productId === p.id))
            .map((p) => ({
              value: p.id,
              label: [p.sku, p.name].filter(Boolean).join(' · '),
            }))}
        />
      </div>

      {/* Cart */}
      {cart.length === 0 ? (
        <Empty
          description="Ҳали маҳсулот қўшилмади"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '16px 0' }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 28px', gap: 8, padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <div>Маҳсулот</div><div>Миқдор</div><div>Тан нархи</div><div style={{ textAlign: 'right' }}>Жами</div><div />
          </div>
          {cart.map((item) => (
            <div key={item._key} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px 28px', gap: 8, alignItems: 'center', padding: '7px 8px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                {item.product.sku && (
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{item.product.sku}</div>
                )}
              </div>
              <InputNumber
                value={item.quantity}
                onChange={(v) => updateItem(item._key, { quantity: v ?? 1 })}
                min={0.0001}
                step={1}
                style={{ width: '100%' }}
                addonAfter={<span style={{ fontSize: 11 }}>{PRODUCT_UNIT_LABELS[item.product.unit]}</span>}
              />
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
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>Жами тан нархи:</span>
            <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={totalCost} currency="UZS" /></span>
          </div>
        </>
      )}

      {/* Note */}
      <div style={{ marginTop: 12 }}>
        <Label>Изоҳ (ихтиёрий)</Label>
        <Input.TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Трансфер ҳақида қўшимча маълумот..."
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
