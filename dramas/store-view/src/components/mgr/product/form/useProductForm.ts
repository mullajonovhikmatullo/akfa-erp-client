import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '@store/store-stub'
import { useProductMutation } from '../hooks/useProductMutation'
import {
  createEmptyProductImageChanges,
  type ProductImageChanges,
} from '../images/product-image-changes'
import { createProductSchema, type ProductFormValues } from './productSchema'
import { useProductImagePersistence } from './useProductImagePersistence'

interface UseProductFormOptions {
  t: (key: string) => string
  open: boolean
  product?: Product | null
  imageFiles: File[]
  onImageFilesChange: (files: File[]) => void
  imageChanges: ProductImageChanges
  onImageChangesChange: (changes: ProductImageChanges) => void
  onSuccess?: () => void
}

const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  sku: '',
  unit: 'PIECE',
  lowStockThreshold: undefined,
  categoryId: '',
  branchId: '',
  priceCurrency: 'UZS',
  costPriceUzs: undefined,
  retailPriceUzs: undefined,
  wholesalePriceUzs: undefined,
  costPriceUsd: undefined,
  retailPriceUsd: undefined,
  wholesalePriceUsd: undefined,
  isActive: true,
}

function getProductFormValues(product: Product): ProductFormValues {
  //
  const hasUsdOnly = !product.retailPriceUzs && Boolean(product.retailPriceUsd)

  return {
    name: product.name,
    description: product.description ?? '',
    sku: product.sku ?? '',
    unit: product.unit,
    lowStockThreshold: product.lowStockThreshold ?? undefined,
    categoryId: product.category?.id ?? '',
    branchId: '',
    priceCurrency: hasUsdOnly ? 'USD' : 'UZS',
    costPriceUzs: hasUsdOnly ? undefined : product.costPriceUzs,
    retailPriceUzs: hasUsdOnly ? undefined : product.retailPriceUzs,
    wholesalePriceUzs: hasUsdOnly ? undefined : product.wholesalePriceUzs,
    costPriceUsd: hasUsdOnly ? (product.costPriceUsd ?? undefined) : undefined,
    retailPriceUsd: hasUsdOnly ? (product.retailPriceUsd ?? undefined) : undefined,
    wholesalePriceUsd: hasUsdOnly ? (product.wholesalePriceUsd ?? undefined) : undefined,
    isActive: product.isActive,
  }
}

function getProductPayload(values: ProductFormValues) {
  //
  const { priceCurrency, branchId: _branchId, ...rest } = values

  return {
    ...rest,
    sku: values.sku || undefined,
    description: values.description || undefined,
    categoryId: values.categoryId || undefined,
    lowStockThreshold: values.lowStockThreshold ?? null,
    costPriceUzs: priceCurrency === 'USD' ? 0 : values.costPriceUzs!,
    retailPriceUzs: priceCurrency === 'USD' ? 0 : values.retailPriceUzs!,
    wholesalePriceUzs: priceCurrency === 'USD' ? 0 : values.wholesalePriceUzs!,
    costPriceUsd: priceCurrency === 'USD' ? values.costPriceUsd : undefined,
    retailPriceUsd: priceCurrency === 'USD' ? values.retailPriceUsd : undefined,
    wholesalePriceUsd: priceCurrency === 'USD' ? values.wholesalePriceUsd : undefined,
  }
}

export function useProductForm({
  t,
  open,
  product,
  imageFiles,
  onImageFilesChange,
  imageChanges,
  onImageChangesChange,
  onSuccess,
}: UseProductFormOptions) {
  //
  const isEdit = Boolean(product)
  const schema = useMemo(() => createProductSchema(t), [t])
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })
  const { createProduct, updateProduct } = useProductMutation(t)
  const {
    persistProductImages,
    resetImagePersistence,
    isUploading,
    uploadProgress,
    imageUploadError,
  } = useProductImagePersistence({
    t,
    imageFiles,
    imageChanges,
    onImageFilesChange,
    onImageChangesChange,
  })

  useEffect(() => {
    //
    if (!open) return
    form.reset(product ? getProductFormValues(product) : emptyValues)
  }, [form, open, product])

  const resetFlow = useCallback(() => {
    //
    setCreatedProductId(null)
    resetImagePersistence()
  }, [resetImagePersistence])

  useEffect(() => {
    resetFlow()
  }, [product?.id, resetFlow])

  const finishSubmission = () => {
    //
    onImageFilesChange([])
    onImageChangesChange(createEmptyProductImageChanges())
    resetFlow()
    onSuccess?.()
    form.reset()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    //
    const payload = getProductPayload(values)

    if (product) {
      try {
        await updateProduct.mutateAsync({ id: product.id, payload })
        if (!(await persistProductImages(product.id))) return
        finishSubmission()
      } catch {
        return
      }
      return
    }

    try {
      let productId = createdProductId
      if (productId) {
        await updateProduct.mutateAsync({ id: productId, payload })
      } else {
        const created = await createProduct.mutateAsync({
          ...payload,
          branchId: values.branchId || undefined,
        })
        productId = created.id
        setCreatedProductId(productId)
      }

      if (!(await persistProductImages(productId))) return
      finishSubmission()
    } catch {
      return
    }
  })

  return {
    form,
    onSubmit,
    isPending: createProduct.isPending || updateProduct.isPending || isUploading,
    isEdit,
    isUploading,
    uploadProgress,
    imageUploadError,
    isAwaitingImageRetry: Boolean(imageUploadError),
    resetFlow,
  }
}
