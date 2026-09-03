import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Empty, Select, Table } from 'antd'

import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { Label } from './Label'
import { createStockInColumns } from './stockInColumns'
import type { StockInCartItem, StockInFormValues } from './types'

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
  totalCost: number
  onAddProduct: (productId: string) => void
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
  totalCost,
  onAddProduct,
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
        <Select
          showSearch
          optionFilterProp="searchText"
          onChange={onAddProduct}
          value={null}
          placeholder={t('stockIn.placeholderSearch')}
          className="u-w-full"
          loading={productsLoading}
          suffixIcon={productsLoading ? undefined : <i className="icons-plus icon-size-16" />}
          notFoundContent={productsLoading ? <SelectLoadingContent /> : undefined}
          options={products
            .filter((product) => product.isActive && !selectedProductIds.has(product.id))
            .map((product) => ({
              value: product.id,
              searchText: [product.sku, product.name].filter(Boolean).join(' '),
              label: (
                <div className="u-items-center u-flex u-gap-8 u-min-w-0">
                  {product.sku ? (
                    <span className="num u-text-muted u-inline-block u-shrink-0 u-fs-11 u-max-w-88 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap" >
                      {product.sku}
                    </span>
                  ) : null}
                  <span className="u-flex-auto u-fw-600 u-min-w-0">
                    <EllipsisText maxWidth="100%">{product.name}</EllipsisText>
                  </span>
                </div>
              ),
            }))}
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
            scroll={{ x: 860 }}
            columns={createStockInColumns({ t, onChangeQty, onUpdateQty, onUpdateItem, onRemoveItem })}
          />
          <div className="u-items-center u-flex u-fs-13 u-gap-8 u-justify-end u-pr-32">
            <span className="u-text-muted u-mr-8">{t('stockIn.totalCostLabel')}</span>
            <span className="num u-inline-block u-fw-700 u-max-w-180 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap" >
              <MoneyDisplay amount={totalCost} currency="UZS" compact />
            </span>
          </div>
        </>
      )}
    </div>
  )
}
