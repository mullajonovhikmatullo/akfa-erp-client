import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Button, Empty, InputNumber, Select, Table } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { getProductPrice, getProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useProductsList } from '../../product/hooks/useProductsList'
import { useInventoryMutation } from '../hooks/useInventoryMutation'
import { Label } from './view/Label'
import { createStockInColumns } from './view/stockInColumns'
import type { StockInCartItem } from './view/types'

interface StockInModalProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
}

type StockInFormValues = {
  branchId?: string
  cart: StockInCartItem[]
}

const MIN_QTY = 1

function findDefaultBranch(branches: Branch[]) {
  //
  const mainBranch = branches.find((branch) => /main|asosiy|глав/i.test(branch.name))
  const firstBranch = [...branches].sort((a, b) => {
    //
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return aTime - bTime
  })[0]
  return mainBranch?.id ?? firstBranch?.id
}

export function StockInModal({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate }: StockInModalProps) {
  //
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const { data: products = [], isLoading: productsLoading } = useProductsList({ isActive: true })
  const { stockInBatch } = useInventoryMutation(t)
  const { control, handleSubmit, reset, setValue, watch } = useForm<StockInFormValues>({
    defaultValues: {
      branchId: isStoreOwner ? undefined : (userBranchId ?? undefined),
      cart: [],
    },
  })
  const { append, update, remove } = useFieldArray({
    control,
    name: 'cart',
    keyName: 'fieldId',
  })
  const branchId = watch('branchId')
  const cart = watch('cart') ?? []

  const defaultBranchId = useMemo(() => findDefaultBranch(branches), [branches])

  useEffect(() => {
    //
    if (isStoreOwner && open && defaultBranchId && !branchId) {
      setValue('branchId', defaultBranchId)
    }
    if (!isStoreOwner) {
      setValue('branchId', userBranchId ?? undefined)
    }
  }, [branchId, defaultBranchId, isStoreOwner, open, setValue, userBranchId])

  const addProduct = (productId: string) => {
    //
    const product = products.find((item) => item.id === productId)
    if (!product) return
    const costPrice = getProductPrice(product, 'cost')
    if (cart.find((item) => item.productId === productId)) return
    append({
      _key: `${productId}-${Date.now()}`,
      productId,
      product,
      quantity: 1,
      costPriceUzs: getProductPriceUzs(product, 'cost', effectiveExchangeRate),
      costPriceUsd: costPrice.currency === 'USD' ? costPrice.amount : undefined,
    })
  }

  const updateItem = (key: string, patch: Partial<StockInCartItem>) => {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index < 0) return
    const item = cart[index]
    if (!item) return
    update(index, { ...item, ...patch })
  }

  const updateQty = (key: string, quantity: number | null) => updateItem(key, { quantity: quantity == null ? 0 : Math.max(quantity, 0) })

  const changeQty = (key: string, delta: number) => {
    //
    const item = cart.find((entry) => entry._key === key)
    if (!item) return
    const current = Math.max(item.quantity, 0)
    updateQty(key, delta < 0 ? Math.max(current + delta, MIN_QTY) : current + delta)
  }

  const removeItem = (key: string) => {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index >= 0) remove(index)
  }

  const totalCost = cart.reduce((sum, item) => sum + Math.max(item.quantity, 0) * item.costPriceUzs, 0)
  const hasValidQuantities = cart.every((item) => item.quantity >= MIN_QTY)
  const canSubmit = cart.length > 0 && hasValidQuantities && (isStoreOwner ? Boolean(branchId) : Boolean(userBranchId))

  const submitStockIn = (values: StockInFormValues) => {
    //
    stockInBatch.mutate(
      values.cart.map((item) => ({
        branchId: isStoreOwner ? values.branchId : undefined,
        productId: item.productId,
        quantity: Math.max(item.quantity, MIN_QTY),
        costPriceUzs: item.costPriceUzs,
        costPriceUsd: item.costPriceUsd,
      })),
      {
        onSuccess: () => {
          //
          reset({
            branchId: isStoreOwner ? defaultBranchId : (userBranchId ?? undefined),
            cart: [],
          })
          onClose()
        },
      },
    )
  }

  return (
    <AppModal
      title={t('stockIn.title')}
      open={open}
      onClose={onClose}
      width={920}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={stockInBatch.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={stockInBatch.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit(submitStockIn)}
        >
          {t('stockIn.confirmBtn')} ({cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
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
            onChange={addProduct}
            value={null}
            placeholder={t('stockIn.placeholderSearch')}
            style={{ width: '100%' }}
            loading={productsLoading}
            suffixIcon={productsLoading ? undefined : <PlusIcon size={16} />}
            notFoundContent={productsLoading ? <SelectLoadingContent /> : undefined}
            options={products
              .filter((product) => product.isActive && !cart.find((item) => item.productId === product.id))
              .map((product) => ({
                value: product.id,
                searchText: [product.sku, product.name].filter(Boolean).join(' '),
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {product.sku ? (
                      <span
                        className="num"
                        style={{
                          display: 'inline-block',
                          flexShrink: 0,
                          maxWidth: 88,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 11,
                          color: 'var(--ink-3)',
                        }}
                      >
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
              columns={createStockInColumns({
                t,
                onChangeQty: changeQty,
                onUpdateQty: updateQty,
                onUpdateItem: updateItem,
                onRemoveItem: removeItem,
              })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('stockIn.totalCostLabel')}</span>
              <span
                className="num"
                style={{ display: 'inline-block', maxWidth: 180, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <MoneyDisplay amount={totalCost} currency="UZS" compact />
              </span>
            </div>
          </>
        )}
      </div>
    </AppModal>
  )
}
