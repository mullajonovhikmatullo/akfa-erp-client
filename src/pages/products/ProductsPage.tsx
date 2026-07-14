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
  useProductsPage,
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
import { getProductPrice } from '@/shared/lib/productPricing';
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

  const { data: result, isLoading, isFetching, refetch } = useProductsPage({
    page,
    pageSize,
    search: search || undefined,
    categoryId,
    isActive: true,
  });
  const products = result?.items ?? [];
  const total = result?.total ?? 0;

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
          {p.category && <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.category.name}</div>}
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
      title: t('products.colCost'),
      key: 'cost',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, p: Product) => {
        const price = getProductPrice(p, 'cost');
        return (
          <span className="num">
            <MoneyDisplay
              amount={price.amount}
              currency={price.currency}
              noConvert={price.currency === 'USD'}
            />
          </span>
        );
      },
    },
    {
      title: t('products.colWholesale'),
      key: 'wholesale',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, p: Product) => {
        const price = getProductPrice(p, 'wholesale');
        return (
          <span className="num" style={{ fontWeight: 600 }}>
            <MoneyDisplay
              amount={price.amount}
              currency={price.currency}
              noConvert={price.currency === 'USD'}
            />
          </span>
        );
      },
    },
    {
      title: t('products.colRetail'),
      key: 'retail',
      width: 150,
      align: 'right',
      render: (_: unknown, p: Product) => {
        const price = getProductPrice(p, 'retail');
        return (
          <span className="num" style={{ fontWeight: 600 }}>
            <MoneyDisplay
              amount={price.amount}
              currency={price.currency}
              noConvert={price.currency === 'USD'}
            />
          </span>
        );
      },
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
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => { e.stopPropagation(); setEditProduct(p); }}
              />
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${p.name}" ${t('products.deleteDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === p.id }}
                onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(p.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending && deleteMutation.variables === p.id}
                  onClick={(e) => e.stopPropagation()}
                />
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
                templateHeaders={['name', 'description', 'sku', 'unit', 'currency', 'costPrice', 'wholesalePrice', 'retailPrice']}
                templateExamples={[
                  ['Mahsulot A', 'Qisqacha tavsif', 'PRF-001', 'PIECE', "SO'M", '65000', '75000', '85000'],
                  ['Mahsulot B', '', 'PRF-002', 'KG', 'USD', '9.00', '10.00', '12.50'],
                ]}
                templateFileName="products_template.xlsx"
                hints={[
                  {
                    label: t('excel.hintsCurrency'),
                    items: ["SO'M", 'USD'],
                  },
                  {
                    label: t('excel.hintsUnits'),
                    items: ['KG', 'PIECE'],
                  },
                ]}
                parseRow={(raw, index) => {
                  const name = getField(raw, 'name');
                  if (!name) return { index, raw, error: "Nomi kiritilishi shart" };

                  const unitRaw = getField(raw, 'unit').toUpperCase();
                  const validUnits = ['KG', 'PIECE'];
                  if (!unitRaw || !validUnits.includes(unitRaw)) {
                    const suggestion = validUnits.find((u) =>
                      u === unitRaw + 'S' || u === 'S' + unitRaw ||
                      unitRaw === u + 'S' || unitRaw === 'S' + u ||
                      u.includes(unitRaw) || unitRaw.includes(u)
                    );
                    const hint = suggestion
                      ? ` — balki "${suggestion}" demoqchimisiz?`
                      : `. To'g'ri qiymatlar: ${validUnits.join(', ')}`;
                    return { index, raw, error: `"${unitRaw}" noto'g'ri o'lchov birligi${hint}` };
                  }

                  const currencyRaw = getField(raw, 'currency').toUpperCase().replace(/['\s]/g, '');
                  const isUsd = currencyRaw === 'USD' || currencyRaw === '$';
                  const isUzs = currencyRaw === 'SOM' || currencyRaw === 'UZS';
                  if (!isUsd && !isUzs) {
                    return { index, raw, error: "Valyuta noto'g'ri. SO'M yoki USD kiriting" };
                  }

                  const costPrice = Number(getField(raw, 'costPrice'));
                  if (isNaN(costPrice) || costPrice < 0) {
                    return { index, raw, error: "Tan narxi noto'g'ri kiritilgan" };
                  }
                  const wholesalePrice = Number(getField(raw, 'wholesalePrice'));
                  if (isNaN(wholesalePrice) || wholesalePrice < 0) {
                    return { index, raw, error: "Ulgurji narxi noto'g'ri kiritilgan" };
                  }
                  const retailPrice = Number(getField(raw, 'retailPrice'));
                  if (isNaN(retailPrice) || retailPrice < 0) {
                    return { index, raw, error: "Dona/KG narxi noto'g'ri kiritilgan" };
                  }
                  if (costPrice > wholesalePrice) {
                    return { index, raw, error: "Tan narxi ulgurji narxdan oshmasligi kerak" };
                  }
                  if (wholesalePrice > retailPrice) {
                    return { index, raw, error: "Ulgurji narxi dona/KG narxdan oshmasligi kerak" };
                  }

                  const description = getField(raw, 'description') || undefined;
                  const sku = getField(raw, 'sku') || undefined;
                  return {
                    index, raw,
                    data: {
                      name, description, sku,
                      unit: unitRaw as CreateProductPayload['unit'],
                      costPriceUzs: isUzs ? costPrice : 0,
                      retailPriceUzs: isUzs ? retailPrice : 0,
                      wholesalePriceUzs: isUzs ? wholesalePrice : 0,
                      costPriceUsd: isUsd ? costPrice : undefined,
                      retailPriceUsd: isUsd ? retailPrice : undefined,
                      wholesalePriceUsd: isUsd ? wholesalePrice : undefined,
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
            onChange={(e) => { setSearch(e.target.value); onPageChange(1, pageSize); }}
            allowClear
            style={{ maxWidth: 300 }}
          />
          <Select
            value={categoryId}
            onChange={(v) => { setCategoryId(v); onPageChange(1, pageSize); }}
            allowClear
            placeholder={t('products.filterAllCategories')}
            style={{ minWidth: 220 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{total}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        {/* Table */}
        <DataTable<Product>
          rowKey="id"
          dataSource={products}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, total, onChange: onPageChange, showSizeChanger: true, showTotal: (n) => `${n} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
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
