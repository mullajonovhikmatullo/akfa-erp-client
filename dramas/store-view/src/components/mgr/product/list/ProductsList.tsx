import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import type { CreateProductPayload, Currency, Product, ProductUnit } from '@store/store-stub'
import { useCategoriesList } from '../../category/hooks/useCategoriesList'
import { useStockBatchesList } from '../../inventory/hooks/useStockBatchesList'
import { usePagination } from '../../shared/hooks/usePagination'
import { ProductDetailDrawer } from '../detail/ProductDetailDrawer'
import { ProductFormModal } from '../form/ProductFormModal'
import { useProductMutation } from '../hooks/useProductMutation'
import { useProductSummary } from '../hooks/useProductSummary'
import { useProductsPage } from '../hooks/useProductsPage'
import {
  createProductImportParser,
  PRODUCT_FILTER_CURRENCIES,
  PRODUCT_IMPORT_UNITS,
} from './productImport'
import { createProductColumns } from './view/productColumns'

type ProductStatusFilter = 'all' | 'active' | 'inactive'

type ProductFiltersForm = {
  search: string
  categoryId?: string
  status: ProductStatusFilter
  unit?: ProductUnit
  priceCurrency?: Currency
}

interface ProductsListProps {
  t: (key: string) => string
  canManage: boolean
  isStoreOwner: boolean
  userBranchId?: string | null
  activeBranchId?: string
}

export function ProductsList({ t, canManage, isStoreOwner, userBranchId, activeBranchId }: ProductsListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<ProductFiltersForm>({
    defaultValues: {
      search: '',
      categoryId: undefined,
      status: 'all',
      unit: undefined,
      priceCurrency: undefined,
    },
  })
  const filters = watch()
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null | undefined>(undefined)
  const isActiveFilter = filters.status === 'all' ? undefined : filters.status === 'active'
  const scopedBranchId = isStoreOwner
    ? activeBranchId && activeBranchId !== '__all__'
      ? activeBranchId
      : undefined
    : userBranchId ?? undefined

  const { data: result, isLoading, isFetching, refetch } = useProductsPage({
    page,
    pageSize,
    search: filters.search || undefined,
    categoryId: filters.categoryId,
    unit: filters.unit,
    isActive: isActiveFilter,
    priceCurrency: filters.priceCurrency,
  })
  const { data: stockBatches, isLoading: stockBatchesLoading, refetch: refetchStockBatches } =
    useStockBatchesList({ branchId: scopedBranchId })
  const { data: productSummary, refetch: refetchProductSummary } = useProductSummary()
  const { data: categories = [] } = useCategoriesList()
  const { createProduct, deleteProduct } = useProductMutation(t, { showCreateSuccess: false })

  const products = result?.items ?? []
  const total = result?.total ?? 0
  const activeProducts = productSummary?.totalActive ?? 0
  const inactiveProducts = productSummary?.totalInactive ?? 0
  const importBranchId = scopedBranchId ?? ''
  const parseProductImportRow = useMemo(
    () => createProductImportParser({ categories, branchId: importBranchId, t }),
    [categories, importBranchId, t],
  )
  const stockedProductIds = useMemo(
    () => new Set((stockBatches ?? []).map((batch) => batch.product.id)),
    [stockBatches],
  )
  const columns = createProductColumns({
    t,
    rowIndex,
    canManage,
    deleting: deleteProduct.isPending,
    deletingId: deleteProduct.variables,
    isNewProduct: (product) => Boolean(stockBatches) && !stockedProductIds.has(product.id),
    onView: setDrawerProduct,
    onEdit: setEditProduct,
    onDelete: (id) => deleteProduct.mutate(id),
  })
  const productImportHints = [
    {
      label: t('excel.hintsUnits'),
      items: PRODUCT_IMPORT_UNITS.map((unit) => `${unit} / ${t(`units.${unit}`)}`),
    },
    ...(categories.length > 0
      ? [{ label: t('excel.hintsCategories'), items: categories.map((category) => category.name) }]
      : []),
  ]

  function handleRefresh() {
    //
    void Promise.all([refetch(), refetchProductSummary(), refetchStockBatches()])
  }

  const resetPage = () => onPageChange(1, pageSize)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.products')}</h1>
          <div className="sub">
            <strong>{activeProducts + inactiveProducts} {t('analytics.skuSuffix')}</strong> ·{' '}
            <span style={{ color: 'var(--success)' }}>
              {activeProducts} {t('common.active')}
            </span>{' '}
            ·{' '}
            <span style={{ color: 'var(--danger)' }}>
              {inactiveProducts} {t('common.inactive')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage ? (
            <>
              <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={() => setEditProduct(null)}>
                {t('products.newProduct')}
              </Button>
              <ExcelImportButton<CreateProductPayload>
                t={t}
                entityLabel={t('nav.products')}
                templateHeaders={[
                  'name',
                  'description',
                  'sku',
                  'unit',
                  'lowStockThreshold',
                  'categoryName',
                  'costPriceUzs',
                  'retailPriceUzs',
                  'wholesalePriceUzs',
                  'costPriceUsd',
                  'retailPriceUsd',
                  'wholesalePriceUsd',
                ]}
                templateExamples={[
                  ['Mahsulot A', 'Qisqacha tavsif', 'PRF-001', t('units.PIECE'), '50', categories[0]?.name ?? '', '65000', '85000', '75000', '', '', ''],
                  ['Mahsulot B', '', 'PRF-002', t('units.KG'), '5', categories[0]?.name ?? '', '', '', '', '9.00', '12.50', '10.00'],
                ]}
                templateFileName="products_template.xlsx"
                hints={productImportHints}
                disabled={!importBranchId}
                disabledReason={t('productForm.placeholderBranch')}
                parseRow={parseProductImportRow}
                createFn={createProduct.mutateAsync}
                onComplete={() => void Promise.all([refetch(), refetchProductSummary()])}
              />
            </>
          ) : null}
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={handleRefresh}
            />
          </Tooltip>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<MagnifyingGlassIcon size={18} />}
                placeholder={t('products.searchPlaceholder')}
                value={field.value}
                onChange={(event) => {
                  //
                  field.onChange(event.target.value)
                  resetPage()
                }}
                allowClear
                style={{ maxWidth: 300 }}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  //
                  field.onChange(value)
                  resetPage()
                }}
                allowClear
                placeholder={t('products.filterAllCategories')}
                style={{ minWidth: 220 }}
                options={categories.map((category) => ({ value: category.id, label: category.name }))}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select<ProductStatusFilter>
                value={field.value}
                onChange={(value) => {
                  //
                  field.onChange(value)
                  resetPage()
                }}
                style={{ minWidth: 160 }}
                options={[
                  { value: 'all', label: t('products.filterAllStatuses') },
                  { value: 'active', label: t('common.active') },
                  { value: 'inactive', label: t('common.inactive') },
                ]}
              />
            )}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <Select<ProductUnit>
                value={field.value}
                onChange={(value) => {
                  //
                  field.onChange(value)
                  resetPage()
                }}
                allowClear
                placeholder={t('products.filterAllUnits')}
                style={{ minWidth: 150 }}
                options={PRODUCT_IMPORT_UNITS.map((unit) => ({ value: unit, label: t(`units.${unit}`) }))}
              />
            )}
          />
          <Controller
            name="priceCurrency"
            control={control}
            render={({ field }) => (
              <Select<Currency>
                value={field.value}
                onChange={(value) => {
                  //
                  field.onChange(value)
                  resetPage()
                }}
                allowClear
                placeholder={t('products.filterAllCurrencies')}
                style={{ minWidth: 150 }}
                options={PRODUCT_FILTER_CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
              />
            )}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{total}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Product>
          rowKey="id"
          dataSource={products}
          columns={columns}
          loading={isLoading || stockBatchesLoading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (count) => `${count} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          onRow={(product) => ({
            onClick: () => setDrawerProduct(product),
            style: { cursor: 'pointer' },
          })}
          emptyText={t('products.empty')}
        />
      </div>

      <ProductFormModal
        t={t}
        isStoreOwner={isStoreOwner}
        open={editProduct !== undefined}
        product={editProduct ?? null}
        onSaved={handleRefresh}
        onClose={() => setEditProduct(undefined)}
      />
      <ProductDetailDrawer t={t} product={drawerProduct} onClose={() => setDrawerProduct(null)} />
    </>
  )
}
