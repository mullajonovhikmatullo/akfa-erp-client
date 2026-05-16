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
  productApi,
} from '@/entities/product';
import type { CreateProductPayload } from '@/entities/product';
import { ExcelImportButton } from '@/features/excel-import';
import { getField } from '@/features/excel-import/lib/parseExcel';
import { ProductFormModal } from '@/features/create-product';
import { ProductDetailDrawer } from '@/widgets/product-detail';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Product, ProductUnit } from '@/shared/types/domain';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

export function ProductsPage() {
  const t = useT();
  const { can } = useCurrentUser();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
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
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Product, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 140,
      responsiveHide: true,
      render: (v: string | null) =>
        v ? (
          <span className="num" style={{ color: 'var(--ink-2)', fontSize: 12 }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: t('nav.products'),
      key: 'name',
      render: (_: unknown, p: Product) => (
        <div>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.category.name}</div>
        </div>
      ),
    },
    {
      title: t('products.colUnit'),
      dataIndex: 'unit',
      width: 90,
      responsiveHide: true,
      render: (v: ProductUnit) => <StatusBadge tone="muted">{PRODUCT_UNIT_LABELS[v]}</StatusBadge>,
    },
    {
      title: t('products.colRetail'),
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
      title: t('products.colWholesale'),
      key: 'wholesale',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, p: Product) => (
        <span className="num">
          <MoneyDisplay amount={p.wholesalePriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      width: 100,
      align: 'center',
      responsiveHide: true,
      render: (v: boolean) =>
        v ? (
          <StatusBadge tone="success" dot>{t('common.active')}</StatusBadge>
        ) : (
          <StatusBadge tone="danger" dot>{t('common.inactive')}</StatusBadge>
        ),
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 120,
      responsiveHide: true,
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
          <Tooltip title={t('common.view')}>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => { e.stopPropagation(); setDrawerProduct(p); }}
            />
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title={t('common.edit')}>
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); setEditProduct(p); }}
                />
              </Tooltip>
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${p.name}" ${t('products.deleteDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(p.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Tooltip title={t('common.delete')}>
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
          <h1>{t('nav.products')}</h1>
          <div className="sub">
            {products.length} SKU · {t('products.subtitleSuffix')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          {canManage && (
            <>
              <ExcelImportButton<CreateProductPayload>
                entityLabel={t('nav.products')}
                templateHeaders={['name', 'sku', 'unit', 'category', 'retailPriceUzs', 'wholesalePriceUzs']}
                templateExample={['Float Glass 4mm', 'FG-4MM', 'SQUARE_METER', 'Glass Panels', '85000', '75000']}
                templateFileName="products_template.xlsx"
                parseRow={(raw, index) => {
                  const name = getField(raw, 'name');
                  if (!name) return { index, raw, error: 'name is required' };

                  const unitRaw = getField(raw, 'unit').toUpperCase();
                  const validUnits = ['KG', 'PIECE', 'PACK', 'METER', 'SQUARE_METER', 'LITER', 'SET'];
                  if (!validUnits.includes(unitRaw)) {
                    return { index, raw, error: `unit must be one of: ${validUnits.join(', ')}` };
                  }

                  const categoryName = getField(raw, 'category');
                  if (!categoryName) return { index, raw, error: 'category is required' };
                  const cat = categories.find(
                    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
                  );
                  if (!cat) return { index, raw, error: `Category "${categoryName}" not found` };

                  const retailPriceUzs = Number(getField(raw, 'retailPriceUzs'));
                  if (isNaN(retailPriceUzs) || retailPriceUzs < 0) {
                    return { index, raw, error: 'retailPriceUzs must be a valid number' };
                  }
                  const wholesalePriceUzs = Number(getField(raw, 'wholesalePriceUzs'));
                  if (isNaN(wholesalePriceUzs) || wholesalePriceUzs < 0) {
                    return { index, raw, error: 'wholesalePriceUzs must be a valid number' };
                  }

                  const sku = getField(raw, 'sku') || undefined;
                  return {
                    index, raw,
                    data: {
                      name, sku,
                      unit: unitRaw as CreateProductPayload['unit'],
                      categoryId: cat.id,
                      retailPriceUzs,
                      wholesalePriceUzs,
                    },
                  };
                }}
                createFn={(data) => productApi.create(data)}
                onComplete={() => refetch()}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setEditProduct(null)}
              >
                {t('products.newProduct')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
          />
          <Select
            value={categoryId}
            onChange={setCategoryId}
            allowClear
            placeholder={t('products.filterAllCategories')}
            style={{ minWidth: 220 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{products.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        {/* Table */}
        <DataTable<Product>
          rowKey="id"
          dataSource={products}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (total) => `${total} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
          onRow={(p) => ({
            onClick: () => setDrawerProduct(p),
            style: { cursor: 'pointer' },
          })}
          emptyText={t('products.empty')}
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
