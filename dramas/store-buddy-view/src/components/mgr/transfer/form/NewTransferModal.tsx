import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Button, Empty, Input, InputNumber, Select, Table } from 'antd'
import { MinusIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import { getProductPriceUzs } from '@erp/erp-shared/lib/product-pricing'
import { AppModal } from '@erp/erp-shared/ui/app-modal'
import { EllipsisText } from '@erp/erp-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import { SelectLoadingContent } from '@erp/erp-shared/ui/select-loading-content'
import type { Branch, Product } from '@erp/store-buddy-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { useInventoryRecords } from '../../inventory/hooks/useInventory'
import { useProducts } from '../../product/hooks/useProducts'
import { useCreateTransfer } from '../hooks/useTransfers'

interface NewTransferModalProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  isSuper: boolean
  userBranchId?: string | null
  exchangeRate: number
}

interface CartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  unitCostUzs: number
}

type TransferFormValues = {
  fromBranchId?: string
  toBranchId?: string
  note: string
  cart: CartItem[]
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

export function NewTransferModal({ t, open, onClose, isSuper, userBranchId, exchangeRate }: NewTransferModalProps) {
  //
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1
  const { data: branches = [], isLoading: branchesLoading } = useBranches()
  const { data: products = [], isLoading: productsLoading } = useProducts({ isActive: true })
  const createTransfer = useCreateTransfer()
  const { control, handleSubmit, reset, setValue, watch } = useForm<TransferFormValues>({
    defaultValues: {
      fromBranchId: isSuper ? undefined : (userBranchId ?? undefined),
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

  const sourceBranchId = isSuper ? fromBranchId : (userBranchId ?? undefined)
  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useInventoryRecords(
    sourceBranchId ? { branchId: sourceBranchId } : undefined,
    { enabled: Boolean(sourceBranchId) },
  )
  const productSelectLoading = Boolean(sourceBranchId) && (productsLoading || inventoryLoading)

  useEffect(() => {
    //
    if (isSuper && open && defaultFromBranchId && !fromBranchId) {
      setValue('fromBranchId', defaultFromBranchId)
    }
    if (!isSuper) {
      setValue('fromBranchId', userBranchId ?? undefined)
    }
  }, [defaultFromBranchId, fromBranchId, isSuper, open, setValue, userBranchId])

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

  const availableFrom = branches.filter((branch) => branch.id !== toBranchId)
  const availableTo = branches.filter((branch) => branch.id !== sourceBranchId)

  const handleFromBranchChange = (branchId: string) => {
    //
    setValue('fromBranchId', branchId)
    if (toBranchId === branchId) setValue('toBranchId', undefined)
    replace([])
  }

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

  const clampQty = (value: number, max: number) => {
    //
    const integerValue = Math.floor(Number.isFinite(value) ? value : MIN_QTY)
    return Math.min(Math.max(integerValue, MIN_QTY), Math.max(max, MIN_QTY))
  }

  const updateItem = (key: string, patch: Partial<CartItem>) => {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index < 0) return
    const item = cart[index]
    if (!item) return
    const stock = stockByProductId.get(item.productId) ?? 0
    const quantity = patch.quantity == null ? item.quantity : clampQty(patch.quantity, stock)
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
    (isSuper ? fromBranchId !== undefined : Boolean(userBranchId))

  const submitTransfer = (values: TransferFormValues) => {
    //
    createTransfer.mutate(
      {
        fromBranchId: isSuper ? values.fromBranchId : undefined,
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
            fromBranchId: isSuper ? defaultFromBranchId : (userBranchId ?? undefined),
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
            {isSuper ? (
              <Controller
                name="fromBranchId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(value) => {
                      //
                      field.onChange(value)
                      handleFromBranchChange(value)
                    }}
                    placeholder={t('transferModal.placeholderBranch')}
                    style={{ width: '100%' }}
                    loading={branchesLoading}
                    notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                    options={availableFrom.map((branch) => ({ value: branch.id, label: branch.name }))}
                  />
                )}
              />
            ) : (
              <div style={{ padding: '5px 11px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 13 }}>
                {branches.find((branch) => branch.id === userBranchId)?.name ?? t('transferModal.yourBranch')}
              </div>
            )}
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
            <Table<CartItem>
              size="small"
              pagination={false}
              rowKey="_key"
              dataSource={cart}
              scroll={{ x: 860 }}
              columns={[
                {
                  title: t('transferModal.colProduct'),
                  key: 'product',
                  width: 270,
                  render: (_, item) => (
                    <div style={{ minWidth: 0, maxWidth: 270 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                        <EllipsisText maxWidth="100%">{item.product.name}</EllipsisText>
                      </div>
                      {item.product.sku ? (
                        <div
                          className="num"
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.product.sku}
                        </div>
                      ) : null}
                    </div>
                  ),
                },
                {
                  title: t('transferModal.colQty'),
                  key: 'qty',
                  width: 220,
                  render: (_, item) => {
                    //
                    const stock = stockByProductId.get(item.productId) ?? 0
                    return (
                      <QuantityStepper
                        value={item.quantity}
                        max={stock}
                        unitLabel={t(`units.${item.product.unit}`)}
                        onMinus={() => changeQty(item._key, -1)}
                        onPlus={() => changeQty(item._key, 1)}
                        onChange={(value) => updateQty(item._key, value)}
                      />
                    )
                  },
                },
                {
                  title: t('transferModal.colStock'),
                  key: 'stock',
                  width: 140,
                  align: 'right',
                  render: (_, item) => {
                    //
                    const stock = stockByProductId.get(item.productId) ?? 0
                    const remainingStock = Math.max(0, stock - item.quantity)
                    return (
                      <span className="num" style={{ fontWeight: 700, fontSize: 12 }}>
                        {remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}
                      </span>
                    )
                  },
                },
                {
                  title: t('transferModal.colCost'),
                  key: 'cost',
                  width: 170,
                  render: (_, item) => (
                    <InputNumber
                      value={item.unitCostUzs}
                      onChange={(value) => updateItem(item._key, { unitCostUzs: value ?? 0 })}
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                    />
                  ),
                },
                {
                  title: t('transferModal.colTotal'),
                  key: 'total',
                  width: 150,
                  align: 'right',
                  render: (_, item) => (
                    <span
                      className="num"
                      style={{
                        display: 'inline-block',
                        maxWidth: 140,
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <MoneyDisplay amount={item.quantity * item.unitCostUzs} currency="UZS" compact />
                    </span>
                  ),
                },
                {
                  title: '',
                  key: 'del',
                  width: 32,
                  render: (_, item) => <Button size="small" type="text" danger icon={<TrashIcon size={18} />} onClick={() => removeItem(item._key)} />,
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, paddingRight: 32 }}>
              <span style={{ color: 'var(--ink-3)', marginRight: 8 }}>{t('transferModal.totalCostLabel')}</span>
              <span
                className="num"
                style={{ display: 'inline-block', maxWidth: 180, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <MoneyDisplay amount={totalCost} currency="UZS" compact />
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
                {...blockAutofill('akfa-transfer-note')}
                rows={2}
                placeholder={t('transferModal.placeholderNote')}
                maxLength={500}
              />
            )}
          />
        </div>
      </div>
    </AppModal>
  )
}

function Label({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function QuantityStepper({
  value,
  max,
  unitLabel,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number
  max: number
  unitLabel: string
  onMinus: () => void
  onPlus: () => void
  onChange: (value: number | null) => void
}) {
  //
  const effectiveMax = Math.max(max, MIN_QTY)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(96px, 1fr) 30px 38px', gap: 4, alignItems: 'center' }}>
      <Button icon={<MinusIcon size={16} />} onClick={onMinus} disabled={value <= MIN_QTY} style={{ width: 30, height: 30, padding: 0 }} />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(value) => onChange(value == null ? null : Number(value))}
        min={MIN_QTY}
        max={effectiveMax}
        step={1}
        precision={0}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button icon={<PlusIcon size={16} />} onClick={onPlus} disabled={value >= effectiveMax} style={{ width: 30, height: 30, padding: 0 }} />
      <span
        style={{
          height: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-2)',
          color: 'var(--ink-3)',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {unitLabel}
      </span>
    </div>
  )
}
