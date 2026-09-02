import { Controller, type Control } from 'react-hook-form'
import { Empty, Select, Table } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { Label } from './Label'
import { createStockInColumns } from './stockInColumns'
import type { StockInCartItem, StockInFormValues } from './types'

interface StockInFormViewProps {
  t: (key: string) => string
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                style={{ width: 280 }}
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
          style={{ width: '100%' }}
          loading={productsLoading}
          suffixIcon={productsLoading ? undefined : <PlusIcon size={16} />}
          notFoundContent={productsLoading ? <SelectLoadingContent /> : undefined}
          options={products
            .filter((product) => product.isActive && !selectedProductIds.has(product.id))
            .map((product) => ({
              value: product.id,
              searchText: [product.sku, product.name].filter(Boolean).join(' '),
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {product.sku ? (
                    <span className="num" style={{ display: 'inline-block', flexShrink: 0, maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: 'var(--ink-3)' }}>
                      {product.sku}
                    </span>
                  ) : null}
                  <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 600 }}>
                    <EllipsisText maxWidth="100%">{product.name}</EllipsisText>
                  </span>
                </div>
              ),
            }))}
        />
      </div>

      {cart.length === 0 ? (
        <Empty description={t('stockIn.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '16px 0' }} />
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
            <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('stockIn.totalCostLabel')}</span>
            <span className="num" style={{ display: 'inline-block', maxWidth: 180, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <MoneyDisplay amount={totalCost} currency="UZS" compact />
            </span>
          </div>
        </>
      )}
    </div>
  )
}
