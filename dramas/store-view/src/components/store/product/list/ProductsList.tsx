import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, Select, Tooltip } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import type { CreateProductPayload, Currency, Product, ProductUnit } from '@store/store-stub'
import { useCategoriesList } from '../../category/hooks/useCategoriesList'
import { useStockBatchesList } from '../../inventory/hooks/useStockBatchesList'
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
  canManage: boolean
  isStoreOwner: boolean
  userBranchId?: string | null
  activeBranchId?: string
}

export function ProductsList({ canManage, isStoreOwner, userBranchId, activeBranchId }: ProductsListProps) {
  //
  const t = useStoreT()
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

  const { data: result, isLoading, isFetching, refetch, page, pageSize, onPageChange, resetPage, rowIndex } = useProductsPage({
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.products')}</h1>
          <div className="sub">
            <strong>{activeProducts + inactiveProducts} {t('analytics.skuSuffix')}</strong> ·{' '}
            <span className="u-text-success">
              {activeProducts} {t('common.active')}
            </span>{' '}
            ·{' '}
            <span className="u-text-danger">
              {inactiveProducts} {t('common.inactive')}
            </span>
          </div>
        </div>
        <div className="u-flex u-gap-8">
          {canManage ? (
            <>
              <Button type="primary" icon={<i className="icons-plus icon-size-13" />} onClick={() => setEditProduct(null)}>
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
              icon={<i className={['icons-reload icon-size-18', isFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />}
              onClick={handleRefresh}
            />
          </Tooltip>
        </div>
      </div>

      <div className="card u-overflow-hidden u-p-0" >
        <div
          className="u-items-center u-border-b-default u-flex u-flex-wrap u-gap-10 u-p-14-16"
        >
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<i className="icons-search icon-size-18" />}
                placeholder={t('products.searchPlaceholder')}
                value={field.value}
                onChange={(event) => {
                  //
                  field.onChange(event.target.value)
                  resetPage()
                }}
                allowClear
                className="u-max-w-300"
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
                className="u-min-w-220"
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
                className="u-min-w-160"
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
                className="u-min-w-150"
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
                className="u-min-w-150"
                options={PRODUCT_FILTER_CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
              />
            )}
          />
          <span className="u-text-muted u-fs-12-5 u-ml-auto">
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
            className: 'clickable-row',
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
