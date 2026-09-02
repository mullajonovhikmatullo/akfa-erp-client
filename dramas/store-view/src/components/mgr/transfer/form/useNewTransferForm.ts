import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { getProductPriceUzs } from '@store/store-shared/lib/product-pricing'
import type { Branch } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { useInventoryList } from '../../inventory/hooks/useInventoryList'
import { useProductsList } from '../../product/hooks/useProductsList'
import { useTransferMutation } from '../hooks/useTransferMutation'
import type { TransferCartItem, TransferFormValues } from './view/types'

interface UseNewTransferFormOptions {
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

export function useNewTransferForm({
  t,
  open,
  onClose,
  isStoreOwner,
  userBranchId,
  exchangeRate,
}: UseNewTransferFormOptions) {
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
  const { append, update, remove, replace } = useFieldArray({ control, name: 'cart', keyName: 'fieldId' })
  const fromBranchId = watch('fromBranchId')
  const toBranchId = watch('toBranchId')
  const cart = watch('cart') ?? []
  const defaultFromBranchId = useMemo(() => findDefaultBranch(branches), [branches])
  const sourceBranchId = isStoreOwner ? (userBranchId ?? defaultFromBranchId) : (userBranchId ?? undefined)
  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useInventoryList(
    sourceBranchId ? { branchId: sourceBranchId } : undefined,
    { enabled: Boolean(sourceBranchId) },
  )
  const stockByProductId = useMemo(() => {
    //
    const stockMap = new Map<string, number>()
    for (const record of inventoryRecords) {
      stockMap.set(record.product.id, Math.max(0, Math.floor(record.quantity)))
    }
    return stockMap
  }, [inventoryRecords])
  const transferableProducts = useMemo(
    () => products.filter((product) => product.isActive && (stockByProductId.get(product.id) ?? 0) > 0),
    [products, stockByProductId],
  )
  const availableBranches = useMemo(
    () => branches.filter((branch) => branch.id !== sourceBranchId),
    [branches, sourceBranchId],
  )
  const insufficientStockItems = useMemo(
    () => cart.filter((item) => item.quantity > (stockByProductId.get(item.productId) ?? 0)),
    [cart, stockByProductId],
  )
  const totalCost = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitCostUzs, 0),
    [cart],
  )
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

  useEffect(() => {
    //
    if (open && sourceBranchId && fromBranchId !== sourceBranchId) {
      setValue('fromBranchId', sourceBranchId)
      setValue('toBranchId', undefined)
      replace([])
    }
  }, [fromBranchId, open, replace, setValue, sourceBranchId])

  useEffect(() => {
    if (sourceBranchId && toBranchId === sourceBranchId) setValue('toBranchId', undefined)
  }, [setValue, sourceBranchId, toBranchId])

  function addProduct(productId: string) {
    //
    const product = transferableProducts.find((item) => item.id === productId)
    const stock = stockByProductId.get(productId) ?? 0
    if (!product || stock <= 0 || cart.some((item) => item.productId === productId)) return
    append({
      _key: `${productId}-${Date.now()}`,
      productId,
      product,
      quantity: Math.min(MIN_QTY, stock),
      unitCostUzs: getProductPriceUzs(product, 'wholesale', effectiveExchangeRate),
    })
  }

  function updateItem(key: string, patch: Partial<TransferCartItem>) {
    //
    const index = cart.findIndex((item) => item._key === key)
    const item = cart[index]
    if (index < 0 || !item) return
    const nextQuantity = patch.quantity == null ? item.quantity : patch.quantity
    const quantity = Math.max(Math.floor(Number.isFinite(nextQuantity) ? nextQuantity : MIN_QTY), MIN_QTY)
    update(index, { ...item, ...patch, quantity })
  }

  function changeQty(key: string, delta: number) {
    //
    const item = cart.find((entry) => entry._key === key)
    if (item) updateItem(key, { quantity: item.quantity + delta })
  }

  function updateQty(key: string, quantity: number | null) {
    updateItem(key, { quantity: quantity ?? MIN_QTY })
  }

  function removeItem(key: string) {
    //
    const index = cart.findIndex((item) => item._key === key)
    if (index >= 0) remove(index)
  }

  function submitTransfer(values: TransferFormValues) {
    //
    if (!sourceBranchId || !values.toBranchId) return
    createTransfer.mutate(
      {
        fromBranchId: sourceBranchId,
        toBranchId: values.toBranchId,
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
          reset({ fromBranchId: sourceBranchId, toBranchId: undefined, note: '', cart: [] })
          onClose()
        },
      },
    )
  }

  return {
    control,
    handleSubmit,
    submitTransfer,
    branches,
    branchesLoading,
    availableBranches,
    sourceBranchId,
    cart,
    stockByProductId,
    transferableProducts,
    productSelectLoading: Boolean(sourceBranchId) && (productsLoading || inventoryLoading),
    addProduct,
    updateItem,
    changeQty,
    updateQty,
    removeItem,
    insufficientStockItems,
    totalCost,
    canSubmit,
    isPending: createTransfer.isPending,
  }
}
