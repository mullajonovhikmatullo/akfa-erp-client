import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Alert, Empty, Select, Table } from 'antd'

import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { ProductChecklistSelect } from '../../../product/checklist/ProductChecklistSelect'
import { Label } from './Label'
import { createStockInColumns } from './stockInColumns'
import type { StockInCartItem, StockInFormValues, StockInTotals } from './types'

interface StockInFormViewProps {
  t: StoreTranslator
  control: Control<StockInFormValues>
  isStoreOwner: boolean
  branches: Branch[]
  branchesLoading: boolean
  products: Product[]
  productsLoading: boolean
  selectedProductIds: Set<string>
  cart: StockInCartItem[]
  totals: StockInTotals
  rateMissing: boolean
  onAddProduct: (productId: string) => void
  onRemoveProduct: (productId: string) => void
  onChangeQty: (key: string, delta: number) => void
  onUpdateQty: (key: string, value: number | null) => void
  onUpdateItem: (key: string, patch: Partial<StockInCartItem>) => void
  onRemoveItem: (key: string) => void
}

export function StockInFormView({
  t,
  control,
  isStoreOwner,
  branches,
  branchesLoading,
  products,
  productsLoading,
  selectedProductIds,
  cart,
  totals,
  rateMissing,
  onAddProduct,
  onRemoveProduct,
  onChangeQty,
  onUpdateQty,
  onUpdateItem,
  onRemoveItem,
}: StockInFormViewProps) {
  //
  return (
    <div className="u-flex u-flex-col u-gap-12">
      {isStoreOwner ? (
        <div>
          <Label>{t('stockIn.labelBranch')}</Label>
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                placeholder={t('stockIn.placeholderBranch')}
                className="u-w-280"
                loading={branchesLoading}
                notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
              />
            )}
          />
        </div>
      ) : null}

      <div>
        <Label>{t('stockIn.labelAddProduct')}</Label>
        <ProductChecklistSelect
          t={t}
          products={products.filter((product) => product.isActive)}
          selectedIds={[...selectedProductIds]}
          placeholder={t('stockIn.placeholderSearch')}
          loading={productsLoading}
          onAdd={onAddProduct}
          onRemove={onRemoveProduct}
        />
      </div>

      {cart.length === 0 ? (
        <Empty description={t('stockIn.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} className="u-p-16-0" />
      ) : (
        <>
          <Table<StockInCartItem>
            size="small"
            pagination={false}
            rowKey="_key"
            dataSource={cart}
            scroll={{ x: 1100 }}
            columns={createStockInColumns({ t, onChangeQty, onUpdateQty, onUpdateItem, onRemoveItem })}
          />
          {rateMissing ? <Alert type="warning" showIcon message={t('apiErrors.exchangeRateUnavailable')} /> : null}
          <div className="u-items-center u-flex u-flex-wrap u-fs-13 u-gap-16 u-justify-end u-pr-32">
            <span className="u-text-muted u-fs-11 u-flex-auto">{t('stockIn.pricesHint')}</span>
            <span className="u-whitespace-nowrap">
              <span className="u-text-muted u-mr-8">{t('stockIn.totalUzsLabel')}</span>
              <span className="u-fw-600"><MoneyDisplay amount={totals.uzs} currency="UZS" /></span>
            </span>
            <span className="u-whitespace-nowrap">
              <span className="u-text-muted u-mr-8">{t('stockIn.totalUsdLabel')}</span>
              <span className="u-fw-600"><MoneyDisplay amount={totals.usd} currency="USD" /></span>
            </span>
            <span className="u-whitespace-nowrap">
              <span className="u-text-muted u-mr-8">{t('stockIn.totalCostLabel')}</span>
              <span className="num u-fw-700">
                {totals.combinedUzs == null ? '—' : <MoneyDisplay amount={totals.combinedUzs} currency="UZS" />}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
