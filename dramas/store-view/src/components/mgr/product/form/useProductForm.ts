import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFlowApi, ProductSeekApi, type Product, type ProductImage } from '@store/store-stub'
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts'
import { getApiErrorMessage } from '../images/image-utils'
import {
  createEmptyProductImageChanges,
  hasExistingProductImageChanges,
  type ProductImageChanges,
} from '../images/product-image-changes'
import { createProductSchema, type ProductFormValues } from './productSchema'

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
  const queryClient = useQueryClient()
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  useEffect(() => {
    if (!open) return

    if (product) {
      const hasUsdOnly = !product.retailPriceUzs && !!product.retailPriceUsd
      form.reset({
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
      })
      return
    }

    form.reset(emptyValues)
  }, [form, open, product])

  const createMutation = useCreateProduct(t)
  const updateMutation = useUpdateProduct(t)
  const isPending = createMutation.isPending || updateMutation.isPending || isUploading

  const resetFlow = useCallback(() => {
    setCreatedProductId(null)
    setImageUploadError(null)
    setUploadProgress(0)
    setIsUploading(false)
  }, [])

  useEffect(() => {
    resetFlow()
  }, [product?.id, resetFlow])

  const persistProductImages = async (productId: string) => {
    const hasExistingChanges = hasExistingProductImageChanges(imageChanges)
    if (imageFiles.length === 0 && !hasExistingChanges) return true

    setIsUploading(true)
    setUploadProgress(0)
    let remainingFiles = [...imageFiles]
    let remainingChanges: ProductImageChanges = {
      deletedImageIds: [...imageChanges.deletedImageIds],
      replacements: [...imageChanges.replacements],
      orderedImageIds: imageChanges.orderedImageIds
        ? [...imageChanges.orderedImageIds]
        : null,
      primaryImageId: imageChanges.primaryImageId,
    }
    try {
      let currentImages: ProductImage[] = hasExistingChanges
        ? await ProductSeekApi.findProductImages(productId)
        : []
      const idMap = new Map<string, string>()
      const operationCount =
        imageChanges.deletedImageIds.length +
        imageChanges.replacements.length +
        (imageFiles.length > 0 ? 1 : 0) +
        (imageChanges.orderedImageIds ? 1 : 0) +
        (imageChanges.primaryImageId ? 1 : 0)
      let completedOperations = 0
      const advance = () => {
        completedOperations += 1
        setUploadProgress(Math.round((completedOperations / Math.max(1, operationCount)) * 100))
      }
      const operationProgress = (progress: number) => {
        const completedShare = completedOperations / Math.max(1, operationCount)
        const currentShare = progress / 100 / Math.max(1, operationCount)
        setUploadProgress(Math.round((completedShare + currentShare) * 100))
      }

      for (const imageId of imageChanges.deletedImageIds) {
        if (currentImages.some((image) => image.id === imageId)) {
          currentImages = await ProductFlowApi.deleteProductImage({ productId, imageId })
        }
        remainingChanges = {
          ...remainingChanges,
          deletedImageIds: remainingChanges.deletedImageIds.filter((id) => id !== imageId),
        }
        advance()
      }

      for (const replacement of imageChanges.replacements) {
        if (!currentImages.some((image) => image.id === replacement.imageId)) {
          remainingChanges = {
            ...remainingChanges,
            replacements: remainingChanges.replacements.filter(
              (candidate) => candidate.imageId !== replacement.imageId,
            ),
            orderedImageIds:
              remainingChanges.orderedImageIds?.filter(
                (id) => id !== replacement.imageId,
              ) ?? null,
            primaryImageId:
              remainingChanges.primaryImageId === replacement.imageId
                ? undefined
                : remainingChanges.primaryImageId,
          }
          advance()
          continue
        }

        const beforeIds = new Set(currentImages.map((image) => image.id))
        currentImages = await ProductFlowApi.replaceProductImage({
          productId,
          imageId: replacement.imageId,
          file: replacement.file,
          onProgress: operationProgress,
        })
        const replacementImage = currentImages.find((image) => !beforeIds.has(image.id))
        if (replacementImage) {
          idMap.set(replacement.imageId, replacementImage.id)
          remainingChanges = {
            ...remainingChanges,
            orderedImageIds: remainingChanges.orderedImageIds?.map((id) =>
              id === replacement.imageId ? replacementImage.id : id,
            ) ?? null,
            primaryImageId:
              remainingChanges.primaryImageId === replacement.imageId
                ? replacementImage.id
                : remainingChanges.primaryImageId,
          }
        }
        remainingChanges = {
          ...remainingChanges,
          replacements: remainingChanges.replacements.filter(
            (candidate) => candidate.imageId !== replacement.imageId,
          ),
        }
        advance()
      }

      if (imageFiles.length > 0) {
        currentImages = await ProductFlowApi.uploadProductImages(
          productId,
          imageFiles,
          operationProgress,
        )
        remainingFiles = []
        advance()
      }

      if (remainingChanges.orderedImageIds) {
        const currentIds = new Set(currentImages.map((image) => image.id))
        const desiredOrder = remainingChanges.orderedImageIds
          .map((id) => idMap.get(id) ?? id)
          .filter((id) => currentIds.has(id))
        const includedIds = new Set(desiredOrder)
        desiredOrder.push(
          ...currentImages
            .map((image) => image.id)
            .filter((id) => !includedIds.has(id)),
        )
        const orderChanged = desiredOrder.some(
          (id, index) => currentImages[index]?.id !== id,
        )
        if (desiredOrder.length > 0 && orderChanged) {
          currentImages = await ProductFlowApi.reorderProductImages({
            productId,
            payload: { imageIds: desiredOrder },
          })
        }
        remainingChanges = { ...remainingChanges, orderedImageIds: null }
        advance()
      }

      if (remainingChanges.primaryImageId) {
        const primaryImageId =
          idMap.get(remainingChanges.primaryImageId) ?? remainingChanges.primaryImageId
        if (
          currentImages.some((image) => image.id === primaryImageId) &&
          !currentImages.find((image) => image.id === primaryImageId)?.isPrimary
        ) {
          currentImages = await ProductFlowApi.setPrimaryProductImage({
            productId,
            imageId: primaryImageId,
          })
        }
        remainingChanges = { ...remainingChanges, primaryImageId: undefined }
        advance()
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('productImages.saveSuccess'))
      return true
    } catch (error) {
      onImageFilesChange(remainingFiles)
      onImageChangesChange(remainingChanges)
      await queryClient.invalidateQueries({ queryKey: ['products'] }).catch(() => undefined)
      const message = getApiErrorMessage(error, t, 'productImages.actionError')
      setImageUploadError(message)
      toast.error(message)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    //
    const { priceCurrency, branchId, ...rest } = values
    const payload = {
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

    if (isEdit && product) {
      setImageUploadError(null)
      try {
        await updateMutation.mutateAsync({ id: product.id, payload })
        if (!(await persistProductImages(product.id))) return
        onImageFilesChange([])
        onImageChangesChange(createEmptyProductImageChanges())
        resetFlow()
        onSuccess?.()
        form.reset()
      } catch {
        // The mutation owns the translated API error notification.
      }
      return
    }

    setImageUploadError(null)
    try {
      let productId = createdProductId
      if (productId) {
        await updateMutation.mutateAsync({ id: productId, payload })
      } else {
        const created = await createMutation.mutateAsync({
          ...payload,
          branchId: branchId || undefined,
        })
        productId = created.id
        setCreatedProductId(productId)
      }

      if (!(await persistProductImages(productId))) return

      onImageFilesChange([])
      onImageChangesChange(createEmptyProductImageChanges())
      resetFlow()
      onSuccess?.()
      form.reset()
    } catch {
      // Create/update mutations display their own API errors.
    }
  })

  return {
    form,
    onSubmit,
    isPending,
    isEdit,
    isUploading,
    uploadProgress,
    imageUploadError,
    isAwaitingImageRetry: Boolean(imageUploadError),
    resetFlow,
  }
}
