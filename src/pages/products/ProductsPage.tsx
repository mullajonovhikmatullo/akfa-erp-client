import { useState } from 'react';
import { Button, Input, Select, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCategories,
  useDeleteProduct,
} from '@/entities/product';
import { ProductFormModal } from '@/features/create-product';
import { ProductDetailDrawer } from '@/widgets/product-detail';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Product, ProductUnit } from '@/shared/types/domain';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';

export function ProductsPage() {
  const { can } = useCurrentUser();
  const canManage = can('products:create');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null | undefined>(undefined);
  // undefined = modal closed, null = new product, Product = edit

  const { data: products = [], isLoading, isFetching, refetch } = useProducts({
    search: search || undefined,
    categoryId,
  });

  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();

  const columns: ColumnDef<Product>[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 140,
      render: (v: string | null) =>
        v ? (
          <span className="num" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: 'Mahsulot',
      key: 'name',
      render: (_: unknown, p: Product) => (
        <div>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.category.name}</div>
        </div>
      ),
    },
    {
      title: "O'lchov",
      dataIndex: 'unit',
      width: 90,
      render: (v: ProductUnit) => <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[v]}</StatusBadge>,
    },
    {
      title: 'Chakana narx',
      key: 'retail',
      width: 150,
      align: 'right',
      render: (_: unknown, p: Product) => (
        <span className="num" style={{ fontWeight: 600 }}>
          <MoneyDisplay amount={p.retailPriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Ulgurji narx',
      key: 'wholesale',
      width: 150,
      align: 'right',
      render: (_: unknown, p: Product) => (
        <span className="num">
          <MoneyDisplay amount={p.wholesalePriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'isActive',
      width: 100,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <StatusBadge tone="success" dot>Faol</StatusBadge>
        ) : (
          <StatusBadge tone="danger" dot>Nofaol</StatusBadge>
        ),
    },
    {
      title: 'Qo\'shilgan',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, p: Product) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Ko'rish">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => { e.stopPropagation(); setDrawerProduct(p); }}
            />
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title="Tahrirlash">
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); setEditProduct(p); }}
                />
              </Tooltip>
              <Popconfirm
                title="O'chirilsinmi?"
                description={`"${p.name}" mahsulotini o'chirasizmi?`}
                okText="Ha, o'chir"
                cancelText="Bekor"
                okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(p.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="O'chirish">
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mahsulotlar</h1>
          <div className="sub">
            {products.length} ta SKU · filiallar bo'yicha ombor boshqaruvi
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Yangilash">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          {canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setEditProduct(null)}
            >
              Yangi mahsulot
            </Button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="SKU yoki nom bo'yicha qidirish"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
          />
          <Select
            value={categoryId}
            onChange={setCategoryId}
            allowClear
            placeholder="Barcha kategoriyalar"
            style={{ minWidth: 220 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{products.length}</strong> ta natija
          </span>
        </div>

        {/* Table */}
        <DataTable<Product>
          rowKey="id"
          dataSource={products}
          columns={columns}
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} ta` }}
          onRow={(p) => ({
            onClick: () => setDrawerProduct(p),
            style: { cursor: 'pointer' },
          })}
          emptyText="Mahsulotlar topilmadi"
        />
      </div>

      {/* Create / Edit modal */}
      <ProductFormModal
        open={editProduct !== undefined}
        product={editProduct ?? null}
        onClose={() => setEditProduct(undefined)}
      />

      {/* Detail drawer */}
      <ProductDetailDrawer
        product={drawerProduct}
        onClose={() => setDrawerProduct(null)}
      />
    </>
  );
}
