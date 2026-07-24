import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Button, Empty, InputNumber, Select, Table } from 'antd'
import { MinusIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { getProductPrice, getProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { EllipsisText } from '@store/store-shared/ui/ellipsis-text'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch, Product } from '@store/store-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { useProducts } from '../../product/hooks/useProducts'
import { useStockInBatch } from '../hooks/useInventory'

interface StockInModalProps {
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
  costPriceUzs: number
  costPriceUsd?: number
}

type StockInFormValues = {
  branchId?: string
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

export function StockInModal({ t, open, onClose, isSuper, userBranchId, exchangeRate }: StockInModalProps) {
  //
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1
  const { data: branches = [], isLoading: branchesLoading } = useBranches()
  const { data: products = [], isLoading: productsLoading } = useProducts({ isActive: true })
  const stockInBatch = useStockInBatch(t)
  const { control, handleSubmit, reset, setValue, watch } = useForm<StockInFormValues>({
    defaultValues: {
      branchId: isSuper ? undefined : (userBranchId ?? undefined),
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
    if (isSuper && open && defaultBranchId && !branchId) {
      setValue('branchId', defaultBranchId)
    }
    if (!isSuper) {
      setValue('branchId', userBranchId ?? undefined)
    }
  }, [branchId, defaultBranchId, isSuper, open, setValue, userBranchId])

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

  const updateItem = (key: string, patch: Partial<CartItem>) => {
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
  const canSubmit = cart.length > 0 && hasValidQuantities && (isSuper ? Boolean(branchId) : Boolean(userBranchId))

  const submitStockIn = (values: StockInFormValues) => {
    //
    stockInBatch.mutate(
      values.cart.map((item) => ({
        branchId: isSuper ? values.branchId : undefined,
        productId: item.productId,
        quantity: Math.max(item.quantity, MIN_QTY),
        costPriceUzs: item.costPriceUzs,
        costPriceUsd: item.costPriceUsd,
      })),
      {
        onSuccess: () => {
          //
          reset({
            branchId: isSuper ? defaultBranchId : (userBranchId ?? undefined),
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
        {isSuper ? (
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
            <Table<CartItem>
              size="small"
              pagination={false}
              rowKey="_key"
              dataSource={cart}
              scroll={{ x: 860 }}
              columns={[
                {
                  title: t('stockIn.colProduct'),
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
                  title: t('stockIn.colQty'),
                  key: 'qty',
                  width: 220,
                  render: (_, item) => (
                    <QuantityStepper
                      value={item.quantity}
                      unitLabel={t(`units.${item.product.unit}`)}
                      onMinus={() => changeQty(item._key, -1)}
                      onPlus={() => changeQty(item._key, 1)}
                      onChange={(value) => updateQty(item._key, value)}
                    />
                  ),
                },
                {
                  title: t('stockIn.colCost'),
                  key: 'cost',
                  width: 170,
                  render: (_, item) => (
                    <InputNumber
                      value={item.costPriceUzs}
                      onChange={(value) => updateItem(item._key, { costPriceUzs: value ?? 0, costPriceUsd: undefined })}
                      min={0}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                    />
                  ),
                },
                {
                  title: t('stockIn.colTotal'),
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
                      <MoneyDisplay amount={Math.max(item.quantity, 0) * item.costPriceUzs} currency="UZS" compact />
                    </span>
                  ),
                },
                {
                  title: '',
                  key: 'del',
                  width: 32,
                  render: (_, item) => (
                    <Button size="small" type="text" danger icon={<TrashIcon size={18} />} onClick={() => removeItem(item._key)} />
                  ),
                },
              ]}
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
  unitLabel,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number
  unitLabel: string
  onMinus: () => void
  onPlus: () => void
  onChange: (value: number | null) => void
}) {
  //
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(96px, 1fr) 30px 38px', gap: 4, alignItems: 'center' }}>
      <Button icon={<MinusIcon size={16} />} onClick={onMinus} disabled={value <= MIN_QTY} style={{ width: 30, height: 30, padding: 0 }} />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(value) => onChange(value == null ? null : Number(value))}
        min={0}
        step={1}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button icon={<PlusIcon size={16} />} onClick={onPlus} style={{ width: 30, height: 30, padding: 0 }} />
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
