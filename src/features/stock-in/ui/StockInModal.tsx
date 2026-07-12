import { useEffect, useMemo, useState } from 'react';
import { Button, Select, InputNumber, Input, Empty, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProducts } from '@/entities/product';
import { useBranches } from '@/entities/branch';
import { useStockInBatch } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { AppModal, MoneyDisplay } from '@/shared/ui';
import { PRODUCT_UNIT_LABELS, type Product } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';

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
  const t = useT();
  const { isSuper, branchId: userBranchId } = useCurrentUser();
  const { data: branches = [] } = useBranches();
  const { data: products = [] } = useProducts({ isActive: true });
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
    setCart((prev) => {
      if (prev.find((i) => i.productId === productId)) return prev;
      return [
        ...prev,
        {
          _key: `${productId}-${Date.now()}`,
          productId,
          product,
          quantity: 1,
          costPriceUzs: product.costPriceUzs,
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
  const canSubmit = cart.length > 0 && (isSuper ? !!branchId : !!userBranchId);

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
      width={760}
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
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
        )}

        {/* Product search */}
        <div>
          <Label>{t('stockIn.labelAddProduct')}</Label>
          <Select
            showSearch
            optionFilterProp="label"
            onChange={addProduct}
            value={null}
            placeholder={t('stockIn.placeholderSearch')}
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
              columns={[
                {
                  title: t('stockIn.colProduct'),
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
                  title: t('stockIn.colQty'),
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
                  title: t('stockIn.colCost'),
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
                  title: t('stockIn.colSupplierNote'),
                  key: 'note',
                  render: (_, item) => (
                    <Input
                      value={item.supplierNote}
                      onChange={(e) => updateItem(item._key, { supplierNote: e.target.value })}
                      placeholder={t('stockIn.placeholderNote')}
                      maxLength={200}
                    />
                  ),
                },
                {
                  title: t('stockIn.colTotal'),
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
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('stockIn.totalCostLabel')}</span>
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
