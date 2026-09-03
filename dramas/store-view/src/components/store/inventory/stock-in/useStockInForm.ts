import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { getProductPrice, getProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import type { Branch } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useProductsList } from '../../product/hooks/useProductsList'
import { useInventoryMutation } from '../hooks/useInventoryMutation'
import type { StockInCartItem, StockInFormValues } from './view/types'

interface UseStockInFormOptions {
  t: (key: string) => string
  open: boolean
  onClose: () => void
  isStoreOwner: boolean
  userBranchId?: string | null
  exchangeRate: number
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

export function useStockInForm({ t, open, onClose, isStoreOwner, userBranchId, exchangeRate }: UseStockInFormOptions) {
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
  const { append, update, remove } = useFieldArray({ control, name: 'cart', keyName: 'fieldId' })
  const branchId = watch('branchId')
  const cart = watch('cart') ?? []
  const defaultBranchId = useMemo(() => findDefaultBranch(branches), [branches])
  const selectedProductIds = useMemo(() => new Set(cart.map((item) => item.productId)), [cart])
  const totalCost = useMemo(
    () => cart.reduce((sum, item) => sum + Math.max(item.quantity, 0) * item.costPriceUzs, 0),
    [cart],
  )
  const canSubmit =
    cart.length > 0 &&
    cart.every((item) => item.quantity >= MIN_QTY) &&
    (isStoreOwner ? Boolean(branchId) : Boolean(userBranchId))

  useEffect(() => {
    //
    if (isStoreOwner && open && defaultBranchId && !branchId) setValue('branchId', defaultBranchId)
    if (!isStoreOwner) setValue('branchId', userBranchId ?? undefined)
  }, [branchId, defaultBranchId, isStoreOwner, open, setValue, userBranchId])

  function addProduct(productId: string) {
    //
    const product = products.find((item) => item.id === productId)
    if (!product || selectedProductIds.has(productId)) return
    const costPrice = getProductPrice(product, 'cost')
    append({
      _key: `${productId}-${Date.now()}`,
      productId,
      product,
      quantity: MIN_QTY,
      costPriceUzs: getProductPriceUzs(product, 'cost', effectiveExchangeRate),
      costPriceUsd: costPrice.currency === 'USD' ? costPrice.amount : undefined,
    })
  }

  function updateItem(key: string, patch: Partial<StockInCartItem>) {
    //
    const index = cart.findIndex((item) => item._key === key)
    const item = cart[index]
    if (index >= 0 && item) update(index, { ...item, ...patch })
  }

  function updateQty(key: string, quantity: number | null) {
    updateItem(key, { quantity: quantity == null ? 0 : Math.max(quantity, 0) })
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
    const index = cart.findIndex((item) => item._key === key)
    if (index >= 0) remove(index)
  }

  function submitStockIn(values: StockInFormValues) {
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
          reset({ branchId: isStoreOwner ? defaultBranchId : (userBranchId ?? undefined), cart: [] })
          onClose()
        },
      },
    )
  }

  return {
    control,
    handleSubmit,
    submitStockIn,
    branches,
    branchesLoading,
    products,
    productsLoading,
    selectedProductIds,
    cart,
    totalCost,
    canSubmit,
    addProduct,
    updateItem,
    updateQty,
    changeQty,
    removeItem,
    isPending: stockInBatch.isPending,
  }
}
