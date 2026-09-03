import type { StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Alert, Empty, Input, Select, Table } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { Label } from './Label'
import { createTransferColumns } from './transferColumns'
import type { TransferCartItem, TransferFormValues } from './types'

interface TransferFormViewProps {
  t: StoreTranslator
  control: Control<TransferFormValues>
  branches: Branch[]
  branchesLoading: boolean
  availableBranches: Branch[]
  sourceBranchId?: string
  cart: TransferCartItem[]
  stockByProductId: Map<string, number>
  transferableProducts: Product[]
  productSelectLoading: boolean
  insufficientStockItems: TransferCartItem[]
  totalCost: number
  onAddProduct: (productId: string) => void
  onChangeQty: (key: string, delta: number) => void
  onUpdateQty: (key: string, value: number | null) => void
  onUpdateItem: (key: string, patch: Partial<TransferCartItem>) => void
  onRemoveItem: (key: string) => void
}

export function TransferFormView({
  t,
  control,
  branches,
  branchesLoading,
  availableBranches,
  sourceBranchId,
  cart,
  stockByProductId,
  transferableProducts,
  productSelectLoading,
  insufficientStockItems,
  totalCost,
  onAddProduct,
  onChangeQty,
  onUpdateQty,
  onUpdateItem,
  onRemoveItem,
}: TransferFormViewProps) {
  //
  const selectedProductIds = new Set(cart.map((item) => item.productId))

  return (
    <div className="u-flex u-flex-col u-gap-12">
      <div className="u-grid u-gap-12 u-grid-cols-fit-260">
        <div>
          <Label>{t('transferModal.labelFrom')}</Label>
          <div className="u-bg-surface-2 u-rounded-6 u-border-default u-fs-13 u-p-5-11">
            {branches.find((branch) => branch.id === sourceBranchId)?.name ?? t('transferModal.yourBranch')}
          </div>
        </div>
        <div>
          <Label>{t('transferModal.labelTo')}</Label>
          <Controller
            name="toBranchId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                placeholder={t('transferModal.placeholderBranch')}
                className="u-w-full"
                loading={branchesLoading}
                notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                options={availableBranches.map((branch) => ({ value: branch.id, label: branch.name }))}
              />
            )}
          />
        </div>
      </div>

      <div>
        <Label>{t('transferModal.labelAddProduct')}</Label>
        <Select
          showSearch
          optionFilterProp="searchText"
          onChange={onAddProduct}
          value={null}
          placeholder={t('transferModal.placeholderSearch')}
          className="u-w-full"
          loading={productSelectLoading}
          suffixIcon={productSelectLoading ? undefined : <i className="icons-plus icon-size-16" />}
          disabled={!sourceBranchId}
          notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
          options={transferableProducts
            .filter((product) => !selectedProductIds.has(product.id))
            .map((product) => {
              //
              const stock = stockByProductId.get(product.id) ?? 0
              return {
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
                    <span className="u-text-muted u-shrink-0 u-fs-12">
                      {t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${product.unit}`)}
                    </span>
                  </div>
                ),
              }
            })}
        />
      </div>

      {cart.length === 0 ? (
        <Empty description={t('transferModal.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} className="u-p-16-0" />
      ) : (
        <>
          {insufficientStockItems.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message={t('transferModal.insufficientStock')}
              description={(
                <div className="u-grid u-gap-2">
                  {insufficientStockItems.map((item) => {
                    //
                    const stock = stockByProductId.get(item.productId) ?? 0
                    return (
                      <div key={item._key}>
                        <strong>{item.product.name}</strong>: {t('newSale.availableStock')} {stock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                      </div>
                    )
                  })}
                </div>
              )}
            />
          ) : null}
          <Table<TransferCartItem>
            size="small"
            pagination={false}
            rowKey="_key"
            dataSource={cart}
            scroll={{ x: 970 }}
            columns={createTransferColumns({
              t,
              stockByProductId,
              onChangeQty,
              onUpdateQty,
              onUpdateItem,
              onRemoveItem,
            })}
          />
          <div className="u-items-center u-flex u-fs-13 u-gap-8 u-justify-end u-pr-32">
            <span className="u-text-muted u-mr-8">{t('transferModal.totalCostLabel')}</span>
            <span className="num u-inline-block u-fs-15 u-fw-800 u-whitespace-nowrap" >
              <MoneyDisplay amount={totalCost} currency="UZS" />
            </span>
          </div>
        </>
      )}

      <div>
        <Label>{t('transferModal.labelNote')}</Label>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              {...blockAutofill('store-transfer-note')}
              rows={2}
              placeholder={t('transferModal.placeholderNote')}
              maxLength={500}
              showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
            />
          )}
        />
      </div>
    </div>
  )
}
