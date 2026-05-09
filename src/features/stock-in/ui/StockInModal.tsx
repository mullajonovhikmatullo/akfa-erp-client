import { useState } from 'react';
import { Button, Select, InputNumber, Input, Empty, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useStockInBatch } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { AppModal, MoneyDisplay } from '@/shared/ui';
import { PRODUCT_UNIT_LABELS, type Product } from '@/shared/types/domain';

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
  supplierNote: string;
}

export function StockInModal({ open, onClose }: StockInModalProps) {
  const { isSuper, branchId: userBranchId } = useCurrentUser();
  const { data: branches = [] } = useBranches();
  const { data: products = [] } = useProducts({ search: undefined });
  const stockInBatch = useStockInBatch();

  const [branchId, setBranchId] = useState<string | undefined>(
    isSuper ? undefined : (userBranchId ?? undefined),
  );
  const [cart, setCart] = useState<CartItem[]>([]);

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
          costPriceUzs: product.wholesalePriceUzs,
          supplierNote: '',
        },
      ];
    });
  };

  const updateItem = (key: string, patch: Partial<CartItem>) =>
    setCart((prev) => prev.map((i) => (i._key === key ? { ...i, ...patch } : i)));

  const removeItem = (key: string) =>
    setCart((prev) => prev.filter((i) => i._key !== key));

  const totalCost = cart.reduce((sum, i) => sum + i.quantity * i.costPriceUzs, 0);
  const canSubmit = cart.length > 0 && (isSuper ? !!branchId : true);

  const handleSubmit = () => {
    stockInBatch.mutate(
      cart.map((i) => ({
        branchId: isSuper ? branchId : undefined,
        productId: i.productId,
        quantity: i.quantity,
        costPriceUzs: i.costPriceUzs,
        supplierNote: i.supplierNote.trim() || undefined,
      })),
      {
        onSuccess: () => {
          setCart([]);
          if (isSuper) setBranchId(undefined);
          onClose();
        },
      },
    );
  };

  return (
    <AppModal
      title="Omborga kirim"
      open={open}
      onClose={onClose}
      width={760}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={stockInBatch.isPending}>
          Bekor qilish
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={stockInBatch.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Kirimni tasdiqlash ({cart.length} ta)
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Branch selector (SUPER_ADMIN only) */}
        {isSuper && (
          <div>
            <Label>Filial</Label>
            <Select
              value={branchId}
              onChange={setBranchId}
              placeholder="Filial tanlang"
              style={{ width: 280 }}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
        )}

        {/* Product search */}
        <div>
          <Label>Mahsulot qo'shish</Label>
          <Select
            showSearch
            optionFilterProp="label"
            onChange={addProduct}
            value={null}
            placeholder="SKU yoki nom bo'yicha qidirish"
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

        {/* Cart table */}
        {cart.length === 0 ? (
          <Empty
            description="Hali mahsulot qo'shilmadi"
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
              columns={[
                {
                  title: 'Mahsulot',
                  key: 'product',
                  render: (_, item) => (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                      {item.product.sku && (
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                          {item.product.sku}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Miqdor',
                  key: 'qty',
                  width: 130,
                  render: (_, item) => (
                    <InputNumber
                      value={item.quantity}
                      onChange={(v) => updateItem(item._key, { quantity: v ?? 1 })}
                      min={0.0001}
                      step={1}
                      style={{ width: '100%' }}
                      addonAfter={
                        <span style={{ fontSize: 11 }}>
                          {PRODUCT_UNIT_LABELS[item.product.unit]}
                        </span>
                      }
                    />
                  ),
                },
                {
                  title: "Tan narxi (so'm)",
                  key: 'cost',
                  width: 160,
                  render: (_, item) => (
                    <InputNumber
                      value={item.costPriceUzs}
                      onChange={(v) => updateItem(item._key, { costPriceUzs: v ?? 0 })}
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                    />
                  ),
                },
                {
                  title: 'Etkazuvchi izohi',
                  key: 'note',
                  render: (_, item) => (
                    <Input
                      value={item.supplierNote}
                      onChange={(e) => updateItem(item._key, { supplierNote: e.target.value })}
                      placeholder="Ixtiyoriy..."
                      maxLength={200}
                    />
                  ),
                },
                {
                  title: 'Jami',
                  key: 'total',
                  width: 130,
                  align: 'right',
                  render: (_, item) => (
                    <span className="num" style={{ fontWeight: 700, fontSize: 13 }}>
                      <MoneyDisplay amount={item.quantity * item.costPriceUzs} currency="UZS" />
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 13, paddingRight: 32 }}>
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>Jami tan narxi:</span>
              <span className="num" style={{ fontWeight: 700 }}>
                <MoneyDisplay amount={totalCost} currency="UZS" />
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
