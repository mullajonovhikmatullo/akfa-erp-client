import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, Popconfirm, Select, Tooltip } from 'antd'
import {
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import { getField, hasMaxTwoDecimals, isUuid, parseExcelNumber } from '@store/store-shared/lib/parse-excel'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import { ProductFlowApi } from '@store/store-stub'
import type { CreateProductPayload, Currency, Product, ProductUnit } from '@store/store-stub'
import { useCategoriesList } from '../../category/hooks/useCategoriesList'
import { useStockBatchesList } from '../../inventory/hooks/useStockBatchesList'
import { usePagination } from '../../shared/hooks/usePagination'
import { ProductDetailDrawer } from '../detail/ProductDetailDrawer'
import { ProductFormModal } from '../form/ProductFormModal'
import { useProductMutation } from '../hooks/useProductMutation'
import { useProductSummary } from '../hooks/useProductSummary'
import { useProductsPage } from '../hooks/useProductsPage'
import { createProductColumns } from './view/productColumns'

const PRODUCT_IMPORT_UNIT_ALIASES: Record<ProductUnit, string[]> = {
  KG: ['KG', 'KGS', 'KILOGRAM', 'KILOGRAMM', 'КГ', 'КИЛО', 'КИЛОГРАММ'],
  PIECE: ['PIECE', 'PIECES', 'PCS', 'PC', 'DONA', 'ДОНА', 'ШТ', 'ШТУК', 'ШТУКА'],
}

const PRODUCT_IMPORT_UNITS = Object.keys(PRODUCT_IMPORT_UNIT_ALIASES) as ProductUnit[]
const PRODUCT_FILTER_CURRENCIES: Currency[] = ['UZS', 'USD']

type ProductWithStockMeta = Product & {
  stockBatchCount?: number
  _count?: {
    stockBatches?: number
    batches?: number
    inventory?: number
  }
}

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

function normaliseUnitValue(value: string) {
  //
  return value.trim().toUpperCase().replace(/[.\s_-]+/g, '')
}

function parseProductImportUnit(value: string): ProductUnit | undefined {
  //
  const normalised = normaliseUnitValue(value)
  if (!normalised) return undefined

  return PRODUCT_IMPORT_UNITS.find((unit) => {
    //
    const acceptedValues = [unit, PRODUCT_UNIT_LABELS[unit], ...PRODUCT_IMPORT_UNIT_ALIASES[unit]]
    return acceptedValues.some((accepted) => normaliseUnitValue(accepted) === normalised)
  })
}

function normaliseImportLookupValue(value: string) {
  //
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
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

  const { data: result, isLoading, isFetching, refetch } = useProductsPage({
    page,
    pageSize,
    search: filters.search || undefined,
    categoryId: filters.categoryId,
    unit: filters.unit,
    isActive: isActiveFilter,
    priceCurrency: filters.priceCurrency,
  })
  const products = result?.items ?? []
  const total = result?.total ?? 0
  const scopedBranchId = isStoreOwner
    ? activeBranchId && activeBranchId !== '__all__' ? activeBranchId : undefined
    : userBranchId ?? undefined
  const { data: stockBatches, isLoading: stockBatchesLoading, refetch: refetchStockBatches } = useStockBatchesList({
    branchId: scopedBranchId,
  })
  const { data: productSummary, refetch: refetchProductSummary } = useProductSummary()
  const activeProducts = productSummary?.totalActive ?? 0
  const inactiveProducts = productSummary?.totalInactive ?? 0
  const totalProducts = activeProducts + inactiveProducts

  const { data: categories = [] } = useCategoriesList()
  const { deleteProduct } = useProductMutation(t)
  const defaultProductCategoryName = categories[0]?.name ?? ''
  const importBranchId = scopedBranchId
  const unitHintText = PRODUCT_IMPORT_UNITS.map((unit) => `${unit} / ${t(`units.${unit}`)}`).join(', ')
  const productImportHints = [
    {
      label: t('excel.hintsUnits'),
      items: PRODUCT_IMPORT_UNITS.map((unit) => `${unit} / ${t(`units.${unit}`)}`),
    },
    ...(categories.length > 0
      ? [
          {
            label: t('excel.hintsCategories'),
            items: categories.map((category) => category.name),
          },
        ]
      : []),
  ]

  function handleRefresh() {
    //
    refetch()
    refetchProductSummary()
    refetchStockBatches()
  }

  const stockedProductIds = new Set((stockBatches ?? []).map((batch) => batch.product.id))
  const isNewProduct = (product: Product) => {
    //
    const productWithMeta = product as ProductWithStockMeta
    const stockBatchCount =
      productWithMeta.stockBatchCount ??
      productWithMeta._count?.stockBatches ??
      productWithMeta._count?.batches ??
      productWithMeta._count?.inventory

    if (stockBatchCount != null) return stockBatchCount === 0
    return Boolean(stockBatches) && !stockedProductIds.has(product.id)
  }

  const columns = createProductColumns({
    t,
    rowIndex,
    canManage,
    deleting: deleteProduct.isPending,
    deletingId: deleteProduct.variables,
    isNewProduct,
    onView: setDrawerProduct,
    onEdit: setEditProduct,
    onDelete: (id) => deleteProduct.mutate(id),
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.products')}</h1>
          <div className="sub">
            <strong>{totalProducts} {t('analytics.skuSuffix')}</strong> ·{' '}
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
                  ['Mahsulot A', 'Qisqacha tavsif', 'PRF-001', t('units.PIECE'), '50', defaultProductCategoryName, '65000', '85000', '75000', '', '', ''],
                  ['Mahsulot B', '', 'PRF-002', t('units.KG'), '5', defaultProductCategoryName, '', '', '', '9.00', '12.50', '10.00'],
                ]}
                templateFileName="products_template.xlsx"
                hints={productImportHints}
                disabled={!importBranchId}
                disabledReason={t('productForm.placeholderBranch')}
                parseRow={(raw, index) => {
                  //
                  const name = getField(raw, 'name')
                  if (!name) return { index, raw, error: 'Nomi kiritilishi shart' }
                  if (name.length > 200) return { index, raw, error: 'name 200 belgidan oshmasligi kerak' }

                  const unitRaw = getField(raw, 'unit')
                  const unit = parseProductImportUnit(unitRaw)
                  if (!unit) {
                    return { index, raw, error: `"${unitRaw || '-'}" noto'g'ri o'lchov birligi. To'g'ri qiymatlar: ${unitHintText}` }
                  }

                  const description = getField(raw, 'description') || undefined
                  if (description && description.length > 500) return { index, raw, error: 'description 500 belgidan oshmasligi kerak' }

                  const sku = getField(raw, 'sku') || undefined
                  if (sku && (sku.length > 100 || !/^[A-Za-z0-9_-]+$/.test(sku))) {
                    return { index, raw, error: t('validation.skuPattern') }
                  }

                  const categoryName = getField(raw, 'categoryName') || getField(raw, 'category')
                  const matchedCategory = categoryName
                    ? categories.find((category) => normaliseImportLookupValue(category.name) === normaliseImportLookupValue(categoryName))
                    : undefined
                  if (categoryName && !matchedCategory) {
                    return { index, raw, error: `"${categoryName}" kategoriyasi topilmadi. Kategoriyani template ichidagi Values sahifasidan tanlang` }
                  }

                  const legacyCategoryId = getField(raw, 'categoryId') || undefined
                  if (legacyCategoryId && !isUuid(legacyCategoryId)) return { index, raw, error: "categoryId UUID formatida bo'lishi kerak" }
                  const categoryId = matchedCategory?.id ?? legacyCategoryId

                  const thresholdRaw = getField(raw, 'lowStockThreshold')
                  const lowStockThreshold = parseExcelNumber(thresholdRaw)
                  if (thresholdRaw && (lowStockThreshold === undefined || !Number.isFinite(lowStockThreshold))) {
                    return { index, raw, error: 'lowStockThreshold noto\'g\'ri kiritilgan' }
                  }
                  if (lowStockThreshold !== undefined && (lowStockThreshold < 0 || Math.abs(lowStockThreshold * 10000 - Math.round(lowStockThreshold * 10000)) >= 1e-9)) {
                    return { index, raw, error: 'lowStockThreshold manfiy bo\'lmasligi va 4 xonagacha kasr bo\'lishi kerak' }
                  }

                  const readPrice = (field: string) => {
                    //
                    const rawValue = getField(raw, field)
                    const value = parseExcelNumber(rawValue)
                    if (rawValue && (value === undefined || !Number.isFinite(value))) return { error: `${field} noto'g'ri kiritilgan` }
                    if (value !== undefined && value < 0) return { error: `${field} manfiy bo'lishi mumkin emas` }
                    if (value !== undefined && !hasMaxTwoDecimals(value)) return { error: `${field} ko'pi bilan 2 xonali kasr bo'lishi kerak` }
                    return { value, hasValue: rawValue.length > 0 }
                  }

                  const costPriceUzsResult = readPrice('costPriceUzs')
                  if (costPriceUzsResult.error) return { index, raw, error: costPriceUzsResult.error }
                  const retailPriceUzsResult = readPrice('retailPriceUzs')
                  if (retailPriceUzsResult.error) return { index, raw, error: retailPriceUzsResult.error }
                  const wholesalePriceUzsResult = readPrice('wholesalePriceUzs')
                  if (wholesalePriceUzsResult.error) return { index, raw, error: wholesalePriceUzsResult.error }
                  const costPriceUsdResult = readPrice('costPriceUsd')
                  if (costPriceUsdResult.error) return { index, raw, error: costPriceUsdResult.error }
                  const retailPriceUsdResult = readPrice('retailPriceUsd')
                  if (retailPriceUsdResult.error) return { index, raw, error: retailPriceUsdResult.error }
                  const wholesalePriceUsdResult = readPrice('wholesalePriceUsd')
                  if (wholesalePriceUsdResult.error) return { index, raw, error: wholesalePriceUsdResult.error }

                  const uzsPriceCount = [costPriceUzsResult, retailPriceUzsResult, wholesalePriceUzsResult].filter((result) => result.hasValue).length
                  const usdPriceCount = [costPriceUsdResult, retailPriceUsdResult, wholesalePriceUsdResult].filter((result) => result.hasValue).length
                  const hasUzsPrices = uzsPriceCount === 3
                  const hasUsdPrices = usdPriceCount === 3

                  if (uzsPriceCount > 0 && !hasUzsPrices) {
                    return {
                      index,
                      raw,
                      error: "UZS narxlarining 3 tasi ham to'ldirilishi kerak: costPriceUzs, retailPriceUzs, wholesalePriceUzs",
                    }
                  }
                  if (usdPriceCount > 0 && !hasUsdPrices) {
                    return {
                      index,
                      raw,
                      error: "USD narxlarining 3 tasi ham to'ldirilishi kerak: costPriceUsd, retailPriceUsd, wholesalePriceUsd",
                    }
                  }
                  if (!hasUzsPrices && !hasUsdPrices) {
                    return { index, raw, error: "Narxlar kiritilishi kerak: 3 ta UZS yoki 3 ta USD narxni to'ldiring" }
                  }
                  if (hasUzsPrices && hasUsdPrices) {
                    return { index, raw, error: 'Faqat bitta valyuta narxlarini kiriting: yoki 3 ta UZS, yoki 3 ta USD' }
                  }

                  const costPriceUzs = hasUsdPrices ? 0 : costPriceUzsResult.value!
                  const retailPriceUzs = hasUsdPrices ? 0 : retailPriceUzsResult.value!
                  const wholesalePriceUzs = hasUsdPrices ? 0 : wholesalePriceUzsResult.value!
                  const costPriceUsd = hasUsdPrices ? costPriceUsdResult.value : undefined
                  const retailPriceUsd = hasUsdPrices ? retailPriceUsdResult.value : undefined
                  const wholesalePriceUsd = hasUsdPrices ? wholesalePriceUsdResult.value : undefined

                  if (hasUzsPrices) {
                    if (costPriceUzs > wholesalePriceUzs) return { index, raw, error: 'costPriceUzs wholesalePriceUzs dan oshmasligi kerak' }
                    if (wholesalePriceUzs > retailPriceUzs) return { index, raw, error: 'wholesalePriceUzs retailPriceUzs dan oshmasligi kerak' }
                  }
                  if (hasUsdPrices) {
                    if (costPriceUsd! > wholesalePriceUsd!) return { index, raw, error: 'costPriceUsd wholesalePriceUsd dan oshmasligi kerak' }
                    if (wholesalePriceUsd! > retailPriceUsd!) return { index, raw, error: 'wholesalePriceUsd retailPriceUsd dan oshmasligi kerak' }
                  }

                  return {
                    index,
                    raw,
                    data: {
                      name,
                      description,
                      sku,
                      categoryId,
                      branchId: importBranchId,
                      unit,
                      lowStockThreshold,
                      costPriceUzs,
                      retailPriceUzs,
                      wholesalePriceUzs,
                      costPriceUsd,
                      retailPriceUsd,
                      wholesalePriceUsd,
                    },
                  }
                }}
                createFn={(data) => ProductFlowApi.createProduct(data)}
                onComplete={() => {
                  //
                  refetch()
                  refetchProductSummary()
                }}
              />
            </>
          ) : null}
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={handleRefresh} />
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
                  onPageChange(1, pageSize)
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
                  onPageChange(1, pageSize)
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
                  onPageChange(1, pageSize)
                }}
                placeholder={t('products.filterAllStatuses')}
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
                  onPageChange(1, pageSize)
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
                  onPageChange(1, pageSize)
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
