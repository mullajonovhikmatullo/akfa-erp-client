import { Controller, type Control } from 'react-hook-form'
import { Alert, Empty, Input, Select, Table } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { Label } from './Label'
import { createTransferColumns } from './transferColumns'
import type { TransferCartItem, TransferFormValues } from './types'

interface TransferFormViewProps {
  t: (key: string) => string
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <div>
          <Label>{t('transferModal.labelFrom')}</Label>
          <div style={{ padding: '5px 11px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 13 }}>
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
                style={{ width: '100%' }}
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
          style={{ width: '100%' }}
          loading={productSelectLoading}
          suffixIcon={productSelectLoading ? undefined : <PlusIcon size={16} />}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {product.sku ? (
                      <span className="num" style={{ display: 'inline-block', flexShrink: 0, maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: 'var(--ink-3)' }}>
                        {product.sku}
                      </span>
                    ) : null}
                    <span style={{ flex: '1 1 auto', minWidth: 0, fontWeight: 600 }}>
                      <EllipsisText maxWidth="100%">{product.name}</EllipsisText>
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink-3)' }}>
                      {t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${product.unit}`)}
                    </span>
                  </div>
                ),
              }
            })}
        />
      </div>

      {cart.length === 0 ? (
        <Empty description={t('transferModal.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '16px 0' }} />
      ) : (
        <>
          {insufficientStockItems.length > 0 ? (
            <Alert
              type="warning"
              showIcon
              message={t('transferModal.insufficientStock')}
              description={(
                <div style={{ display: 'grid', gap: 2 }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
            <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('transferModal.totalCostLabel')}</span>
            <span className="num" style={{ display: 'inline-block', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap' }}>
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
