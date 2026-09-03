import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import { getSaleProductPrice, getSaleProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import type { Customer, PaymentMethod, Product } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useCustomersList } from '../../customer/hooks/useCustomersList'
import { useStockBatchesList } from '../../inventory/hooks/useStockBatchesList'
import { useProductsList } from '../../product/hooks/useProductsList'
import { useSaleMutation } from '../hooks/useSaleMutation'
import { clearSaleDraft, readSaleDraft, writeSaleDraft } from './saleDraft'
import type { CartItem, SaleFormValues } from './view/types'

interface UseNewSaleFormOptions {
  t: (key: string) => string
  userBranchId?: string | null
  exchangeRate: number
  onSuccess?: () => void
}

const MIN_QTY = 0.0001

function emptySaleFormValues(branchId?: string): SaleFormValues {
  //
  return {
    branchId,
    saleType: 'RETAIL',
    customerId: undefined,
    paymentMethod: 'CASH_UZS',
    paidAmount: 0,
    debtDueDateIso: undefined,
    selectedProductId: undefined,
    cart: [],
  }
}

function persistedSaleFormValues(): SaleFormValues {
  //
  const draft = readSaleDraft()
  return {
    branchId: draft.branchId,
    saleType: draft.saleType,
    customerId: draft.customerId,
    paymentMethod: draft.paymentMethod,
    paidAmount: draft.paidAmount,
    debtDueDateIso: draft.debtDueDateIso,
    selectedProductId: undefined,
    cart: draft.cart,
  }
}

function createCartKey(productId: string) {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useNewSaleForm({ t, userBranchId, exchangeRate, onSuccess }: UseNewSaleFormOptions) {
  //
  const branchFilter = userBranchId ?? undefined
  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1
  const { data: products = [], isLoading: productsLoading } = useProductsList({ isActive: true })
  const { data: batches = [], isLoading: batchesLoading } = useStockBatchesList(
    branchFilter ? { branchId: branchFilter, depleted: false } : undefined,
    { enabled: Boolean(branchFilter) },
  )
  const customerFilters = useMemo(
    () => ({ isActive: true, ...(branchFilter ? { branchId: branchFilter } : {}) }),
    [branchFilter],
  )
  const {
    data: customers = [],
    isLoading: customersLoading,
    isFetching: customersFetching,
    refetch: refetchCustomers,
  } = useCustomersList(customerFilters)
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const { createSale } = useSaleMutation(t)
  const { control, handleSubmit, reset, setValue } = useForm<SaleFormValues>({
    defaultValues: persistedSaleFormValues(),
  })
  const { append, update, remove, replace } = useFieldArray({ control, name: 'cart', keyName: 'fieldId' })
  const formBranchId = useWatch({ control, name: 'branchId' })
  const saleType = useWatch({ control, name: 'saleType' }) ?? 'RETAIL'
  const customerId = useWatch({ control, name: 'customerId' })
  const paymentMethod = useWatch({ control, name: 'paymentMethod' }) ?? 'CASH_UZS'
  const paidAmount = useWatch({ control, name: 'paidAmount' }) ?? 0
  const debtDueDateIso = useWatch({ control, name: 'debtDueDateIso' })
  const cartDraft = useWatch({ control, name: 'cart' }) ?? []
  const [paidAmountError, setPaidAmountError] = useState(false)
  const [productSelectKey, setProductSelectKey] = useState(0)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [optimisticCustomer, setOptimisticCustomer] = useState<Customer | null>(null)

  const customerOptions = useMemo(() => {
    //
    const visibleCustomers = optimisticCustomer && !customers.some((customer) => customer.id === optimisticCustomer.id)
      ? [optimisticCustomer, ...customers]
      : customers

    return visibleCustomers.map((customer) => ({
      value: customer.id,
      label: customer.phone ? `${customer.fullName} · ${customer.phone}` : customer.fullName,
    }))
  }, [customers, optimisticCustomer])
  const customerOptionIds = useMemo(() => new Set(customerOptions.map((option) => option.value)), [customerOptions])
  const stockByProductId = useMemo(() => {
    //
    const stockMap = new Map<string, number>()
    for (const batch of batches) {
      const current = stockMap.get(batch.product.id) ?? 0
      stockMap.set(batch.product.id, current + batch.remainingQty)
    }
    return stockMap
  }, [batches])
  const sellableProducts = useMemo(
    () => products.filter((product) => product.isActive && (stockByProductId.get(product.id) ?? 0) > 0),
    [products, stockByProductId],
  )
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const cart = useMemo<CartItem[]>(
    () =>
      cartDraft.flatMap((item) => {
        //
        const product = productById.get(item.productId)
        if (!product) return []
        return { _key: item.key, productId: item.productId, product, quantity: item.quantity }
      }),
    [cartDraft, productById],
  )
  const selectedProductIds = useMemo(() => new Set(cart.map((item) => item.productId)), [cart])
  const paymentOptions = useMemo(
    () => (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((key) => ({ value: key, label: PAYMENT_METHOD_LABELS[key] })),
    [],
  )
  const unitPrice = useCallback(
    (product: Product) => getSaleProductPriceUzs(product, saleType, effectiveExchangeRate),
    [effectiveExchangeRate, saleType],
  )
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Math.max(item.quantity, 0) * unitPrice(item.product), 0),
    [cart, unitPrice],
  )
  const isUsdPayment = paymentMethod === 'CASH_USD'
  const paidAmountUzsEquivalent = isUsdPayment ? paidAmount * effectiveExchangeRate : paidAmount
  const debtAmount = Math.max(0, subtotal - paidAmountUzsEquivalent)
  const needsCustomer = debtAmount > 0
  const fullPaidAmount = Number((isUsdPayment ? subtotal / effectiveExchangeRate : subtotal).toFixed(2))
  const hasUsdPricedItems = cart.some((item) => getSaleProductPrice(item.product, saleType).currency === 'USD')
  const needsExchangeRate = hasUsdPricedItems || isUsdPayment
  const hasValidQuantities = cart.every((item) => {
    //
    const stock = stockByProductId.get(item.productId) ?? 0
    return item.quantity >= MIN_QTY && item.quantity <= stock
  })
  const canSubmit =
    Boolean(userBranchId) &&
    cart.length > 0 &&
    hasValidQuantities &&
    (!needsExchangeRate || exchangeRate > 0) &&
    (!needsCustomer || Boolean(customerId))

  function addToCart(productId: string) {
    //
    const product = sellableProducts.find((item) => item.id === productId)
    if (!product) return
    const stock = stockByProductId.get(productId) ?? 0
    if (stock <= 0 || cartDraft.some((item) => item.productId === productId)) return
    append({ key: createCartKey(productId), productId, quantity: Math.min(1, stock) })
    setValue('selectedProductId', undefined)
    setProductSelectKey((key) => key + 1)
  }

  function updateQty(key: string, quantity: number | null) {
    //
    const item = cart.find((entry) => entry._key === key)
    const index = cartDraft.findIndex((draftItem) => draftItem.key === key)
    const draftItem = cartDraft[index]
    if (!item || index < 0 || !draftItem) return
    const stock = stockByProductId.get(item.productId) ?? 0
    const nextQuantity = quantity == null || !Number.isFinite(quantity) ? 0 : Math.max(quantity, 0)
    update(index, { ...draftItem, quantity: Math.min(nextQuantity, stock) })
  }

  function changeQty(key: string, delta: number) {
    //
    const item = cart.find((entry) => entry._key === key)
    if (!item) return
    const current = Math.max(item.quantity, 0)
    updateQty(key, delta < 0 ? Math.max(current + delta, MIN_QTY) : current + delta)
  }

  function removeItem(key: string) {
    //
    const index = cartDraft.findIndex((item) => item.key === key)
    if (index >= 0) remove(index)
    setValue('selectedProductId', undefined)
    setProductSelectKey((current) => current + 1)
  }

  function handlePaidAmountChange(value: number | null) {
    //
    const nextValue = value == null || !Number.isFinite(value) ? 0 : Math.max(value, 0)
    setPaidAmountError(nextValue > fullPaidAmount)
    setValue('paidAmount', Math.min(nextValue, fullPaidAmount), { shouldDirty: true })
  }

  function selectCustomer(value?: string) {
    //
    setValue('customerId', value, { shouldDirty: true })
    if (value !== optimisticCustomer?.id) setOptimisticCustomer(null)
  }

  useEffect(() => {
    //
    const nextPaidAmount = Math.min(Math.max(paidAmount, 0), fullPaidAmount)
    if (paidAmount !== nextPaidAmount) setValue('paidAmount', nextPaidAmount)
    setPaidAmountError(false)
  }, [fullPaidAmount, paidAmount, setValue])

  useEffect(() => {
    if (!needsCustomer && debtDueDateIso) setValue('debtDueDateIso', undefined)
  }, [debtDueDateIso, needsCustomer, setValue])

  useEffect(() => {
    //
    if (!branchFilter) return
    if (formBranchId && formBranchId !== branchFilter) {
      clearSaleDraft(branchFilter)
      reset(emptySaleFormValues(branchFilter))
      setPaidAmountError(false)
      setProductSelectKey((current) => current + 1)
      return
    }
    if (!formBranchId) setValue('branchId', branchFilter)
  }, [branchFilter, formBranchId, reset, setValue])

  useEffect(() => {
    //
    if (!branchFilter || batchesLoading || cartDraft.length === 0) return
    const normalizedCart = cartDraft.map((item) => {
      //
      const stock = stockByProductId.get(item.productId) ?? 0
      const quantity = Math.min(Math.max(item.quantity, 0), stock)
      return quantity === item.quantity ? item : { ...item, quantity }
    })
    if (normalizedCart.some((item, index) => item !== cartDraft[index])) replace(normalizedCart)
  }, [batchesLoading, branchFilter, cartDraft, replace, stockByProductId])

  useEffect(() => {
    setOptimisticCustomer(null)
  }, [branchFilter])

  useEffect(() => {
    //
    if (!customerId || customersLoading || customersFetching || optimisticCustomer) return
    if (!customerOptionIds.has(customerId)) setValue('customerId', undefined, { shouldDirty: true })
  }, [customerId, customerOptionIds, customersFetching, customersLoading, optimisticCustomer, setValue])

  useEffect(() => {
    //
    writeSaleDraft({
      branchId: formBranchId,
      saleType,
      customerId: customerId || undefined,
      paymentMethod,
      paidAmount,
      debtDueDateIso,
      cart: cartDraft.map((item) => ({ key: item.key, productId: item.productId, quantity: item.quantity })),
    })
  }, [cartDraft, customerId, debtDueDateIso, formBranchId, paidAmount, paymentMethod, saleType])

  function submitSale(values: SaleFormValues) {
    //
    const nextPaidAmount = values.paidAmount == null || !Number.isFinite(values.paidAmount) ? 0 : Math.max(values.paidAmount, 0)
    const safePaidAmount = Math.min(nextPaidAmount, fullPaidAmount)
    const saleBranchId = values.branchId ?? branchFilter

    createSale.mutate(
      {
        branchId: saleBranchId,
        saleType: values.saleType,
        customerId: values.customerId || undefined,
        paymentMethod: values.paymentMethod,
        paidAmountUzs: isUsdPayment ? 0 : safePaidAmount,
        paidAmountUsd: isUsdPayment ? safePaidAmount : 0,
        usdToUzsRate: needsExchangeRate ? exchangeRate : undefined,
        debtDueDate: needsCustomer && values.debtDueDateIso ? values.debtDueDateIso : undefined,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      },
      {
        onSuccess: () => {
          //
          clearSaleDraft(branchFilter)
          reset(emptySaleFormValues(branchFilter))
          setPaidAmountError(false)
          setProductSelectKey((current) => current + 1)
          onSuccess?.()
        },
      },
    )
  }

  function handleCustomerCreated(customer: Customer) {
    //
    setOptimisticCustomer(customer)
    setValue('customerId', customer.id, { shouldDirty: true })
    void refetchCustomers().then((result) => {
      //
      if (result.data?.some((item) => item.id === customer.id)) {
        setOptimisticCustomer((current) => current?.id === customer.id ? null : current)
      }
    })
  }

  return {
    control,
    handleSubmit,
    setValue,
    branches,
    branchesLoading,
    customersLoading,
    customerOptions,
    selectedCustomerId: customerId && customerOptionIds.has(customerId) ? customerId : undefined,
    selectCustomer,
    creatingCustomer,
    openCustomerForm: () => setCreatingCustomer(true),
    closeCustomerForm: () => setCreatingCustomer(false),
    handleCustomerCreated,
    productSelectKey,
    productSelectLoading: Boolean(branchFilter) && (productsLoading || batchesLoading),
    sellableProducts,
    selectedProductIds,
    stockByProductId,
    addToCart,
    cart,
    saleType,
    unitPrice,
    changeQty,
    updateQty,
    removeItem,
    paymentOptions,
    isUsdPayment,
    paidAmount,
    paidAmountError,
    handlePaidAmountChange,
    fullPaidAmount,
    subtotal,
    debtAmount,
    needsCustomer,
    customerId,
    isPending: createSale.isPending,
    canSubmit,
    submitSale,
  }
}
