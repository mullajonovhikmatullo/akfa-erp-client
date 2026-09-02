import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Alert, Button, Empty, Input, InputNumber, Select, Table } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { getProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useInventoryList } from '../../inventory/hooks/useInventoryList'
import { useProductsList } from '../../product/hooks/useProductsList'
import { useTransferMutation } from '../hooks/useTransferMutation'
import { Label } from './view/Label'
import { QuantityStepper } from './view/QuantityStepper'
import { createTransferColumns } from './view/transferColumns'
import type { TransferCartItem } from './view/types'

interface NewTransferModalProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
}

type TransferFormValues = {
  fromBranchId?: string
  toBranchId?: string
  note: string
  cart: TransferCartItem[]
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

export function NewTransferModal({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate }: NewTransferModalProps) {
  //
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const { data: products = [], isLoading: productsLoading } = useProductsList({ isActive: true })
  const { createTransfer } = useTransferMutation(t)
  const { control, handleSubmit, reset, setValue, watch } = useForm<TransferFormValues>({
    defaultValues: {
      fromBranchId: isStoreOwner ? undefined : (userBranchId ?? undefined),
      toBranchId: undefined,
      note: '',
      cart: [],
    },
  })
  const { append, update, remove, replace } = useFieldArray({
    control,
    name: 'cart',
    keyName: 'fieldId',
  })
  const fromBranchId = watch('fromBranchId')
  const toBranchId = watch('toBranchId')
  const cart = watch('cart') ?? []

  const defaultFromBranchId = useMemo(() => findDefaultBranch(branches), [branches])

  const sourceBranchId = isStoreOwner ? (userBranchId ?? defaultFromBranchId) : (userBranchId ?? undefined)
  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useInventoryList(
    sourceBranchId ? { branchId: sourceBranchId } : undefined,
    { enabled: Boolean(sourceBranchId) },
  )
  const productSelectLoading = Boolean(sourceBranchId) && (productsLoading || inventoryLoading)

  useEffect(() => {
    //
    if (open && sourceBranchId && fromBranchId !== sourceBranchId) {
      setValue('fromBranchId', sourceBranchId)
      setValue('toBranchId', undefined)
      replace([])
    }
  }, [fromBranchId, open, replace, setValue, sourceBranchId])

  useEffect(() => {
    //
    if (sourceBranchId && toBranchId === sourceBranchId) {
      setValue('toBranchId', undefined)
    }
  }, [setValue, sourceBranchId, toBranchId])

  const stockByProductId = useMemo(() => {
    //
    const map = new Map<string, number>()
    for (const record of inventoryRecords) {
      map.set(record.product.id, Math.max(0, Math.floor(record.quantity)))
    }
    return map
  }, [inventoryRecords])

  const transferableProducts = useMemo(
    () => products.filter((product) => product.isActive && (stockByProductId.get(product.id) ?? 0) > 0),
    [products, stockByProductId],
  )

  const availableTo = branches.filter((branch) => branch.id !== sourceBranchId)

  const addProduct = (productId: string) => {
    //
    const product = transferableProducts.find((item) => item.id === productId)
    if (!product) return
    const stock = stockByProductId.get(productId) ?? 0
    if (stock <= 0) return
    if (cart.find((item) => item.productId === productId)) return
    append({
      _key: `${productId}-${Date.now()}`,
      productId,
      product,
      quantity: Math.min(MIN_QTY, stock),
      unitCostUzs: getProductPriceUzs(product, 'wholesale', effectiveExchangeRate),
    })
  }

  const normalizeQty = (value: number) => {
    //
    const integerValue = Math.floor(Number.isFinite(value) ? value : MIN_QTY)
    return Math.max(integerValue, MIN_QTY)
  }

  const updateItem = (key: string, patch: Partial<TransferCartItem>) => {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index < 0) return
    const item = cart[index]
    if (!item) return
    const quantity = patch.quantity == null ? item.quantity : normalizeQty(patch.quantity)
    update(index, { ...item, ...patch, quantity })
  }

  const changeQty = (key: string, delta: number) => {
    //
    const item = cart.find((entry) => entry._key === key)
    if (!item) return
    updateItem(key, { quantity: item.quantity + delta })
  }

  const updateQty = (key: string, quantity: number | null) => updateItem(key, { quantity: quantity == null ? MIN_QTY : quantity })

  const removeItem = (key: string) => {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index >= 0) remove(index)
  }

  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.unitCostUzs, 0)
  const insufficientStockItems = cart.filter((item) => item.quantity > (stockByProductId.get(item.productId) ?? 0))
  const hasValidQuantities = cart.every((item) => {
    //
    const stock = stockByProductId.get(item.productId) ?? 0
    return item.quantity >= MIN_QTY && item.quantity <= stock
  })

  const canSubmit =
    cart.length > 0 &&
    hasValidQuantities &&
    toBranchId !== undefined &&
    toBranchId !== sourceBranchId &&
    Boolean(sourceBranchId)

  const submitTransfer = (values: TransferFormValues) => {
    //
    createTransfer.mutate(
      {
        fromBranchId: sourceBranchId,
        toBranchId: values.toBranchId!,
        items: values.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCostUzs: item.unitCostUzs,
        })),
        note: values.note.trim() || undefined,
      },
      {
        onSuccess: () => {
          //
          reset({
            fromBranchId: sourceBranchId,
            toBranchId: undefined,
            note: '',
            cart: [],
          })
          onClose()
        },
      },
    )
  }

  return (
    <AppModal
      title={t('transferModal.title')}
      open={open}
      onClose={onClose}
      width={920}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={createTransfer.isPending}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createTransfer.isPending}
          disabled={!canSubmit}
          onClick={handleSubmit(submitTransfer)}
        >
          {t('transferModal.submitBtn')} ({cart.length} {t('common.countSuffix')})
        </Button>,
      ]}
    >
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
                  options={availableTo.map((branch) => ({ value: branch.id, label: branch.name }))}
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
            onChange={addProduct}
            value={null}
            placeholder={t('transferModal.placeholderSearch')}
            style={{ width: '100%' }}
            loading={productSelectLoading}
            suffixIcon={productSelectLoading ? undefined : <PlusIcon size={16} />}
            disabled={!sourceBranchId}
            notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
            options={transferableProducts
              .filter((product) => product.isActive && !cart.find((item) => item.productId === product.id))
              .map((product) => {
                //
                const stock = stockByProductId.get(product.id) ?? 0
                return {
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
                onChangeQty: changeQty,
                onUpdateQty: updateQty,
                onUpdateItem: updateItem,
                onRemoveItem: removeItem,
              })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('transferModal.totalCostLabel')}</span>
              <span
                className="num"
                style={{ display: 'inline-block', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap' }}
              >
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
    </AppModal>
  )
}
