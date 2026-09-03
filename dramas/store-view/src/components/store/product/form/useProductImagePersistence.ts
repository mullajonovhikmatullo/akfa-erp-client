import type { StoreTranslator } from '@store/store-i18n'
import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProductImage } from '@store/store-stub'
import { getProductImagesListQuery } from '../hooks/useProductImagesList'
import { useProductMutation } from '../hooks/useProductMutation'
import { getApiErrorMessage } from '../images/image-utils'
import {
  hasExistingProductImageChanges,
  type ProductImageChanges,
} from '../images/product-image-changes'

interface UseProductImagePersistenceOptions {
  t: StoreTranslator
  imageFiles: File[]
  imageChanges: ProductImageChanges
  onImageFilesChange: (files: File[]) => void
  onImageChangesChange: (changes: ProductImageChanges) => void
}

function cloneImageChanges(changes: ProductImageChanges): ProductImageChanges {
  //
  return {
    deletedImageIds: [...changes.deletedImageIds],
    replacements: [...changes.replacements],
    orderedImageIds: changes.orderedImageIds ? [...changes.orderedImageIds] : null,
    primaryImageId: changes.primaryImageId,
  }
}

function getOperationCount(imageFiles: File[], imageChanges: ProductImageChanges) {
  //
  return (
    imageChanges.deletedImageIds.length +
    imageChanges.replacements.length +
    (imageFiles.length > 0 ? 1 : 0) +
    (imageChanges.orderedImageIds ? 1 : 0) +
    (imageChanges.primaryImageId ? 1 : 0)
  )
}

function removeMissingReplacement(
  changes: ProductImageChanges,
  imageId: string,
): ProductImageChanges {
  //
  return {
    ...changes,
    replacements: changes.replacements.filter((candidate) => candidate.imageId !== imageId),
    orderedImageIds: changes.orderedImageIds?.filter((id) => id !== imageId) ?? null,
    primaryImageId: changes.primaryImageId === imageId ? undefined : changes.primaryImageId,
  }
}

function resolveDesiredImageOrder(
  currentImages: ProductImage[],
  orderedImageIds: string[],
  idMap: Map<string, string>,
) {
  //
  const currentIds = new Set(currentImages.map((image) => image.id))
  const desiredOrder = orderedImageIds
    .map((id) => idMap.get(id) ?? id)
    .filter((id) => currentIds.has(id))
  const includedIds = new Set(desiredOrder)
  desiredOrder.push(...currentImages.map((image) => image.id).filter((id) => !includedIds.has(id)))
  return desiredOrder
}

export function useProductImagePersistence({
  t,
  imageFiles,
  imageChanges,
  onImageFilesChange,
  onImageChangesChange,
}: UseProductImagePersistenceOptions) {
  //
  const queryClient = useQueryClient()
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const {
    deleteProductImage,
    replaceProductImage,
    uploadProductImages,
    reorderProductImages,
    setPrimaryProductImage,
  } = useProductMutation(t)

  const resetImagePersistence = useCallback(() => {
    //
    setImageUploadError(null)
    setUploadProgress(0)
    setIsUploading(false)
  }, [])

  const persistProductImages = async (productId: string) => {
    //
    const hasExistingChanges = hasExistingProductImageChanges(imageChanges)
    if (imageFiles.length === 0 && !hasExistingChanges) return true

    setIsUploading(true)
    setUploadProgress(0)
    let remainingFiles = [...imageFiles]
    let remainingChanges = cloneImageChanges(imageChanges)

    try {
      let currentImages: ProductImage[] = hasExistingChanges
        ? await queryClient.fetchQuery(getProductImagesListQuery(productId))
        : []
      const idMap = new Map<string, string>()
      const operationCount = getOperationCount(imageFiles, imageChanges)
      let completedOperations = 0
      const advance = () => {
        //
        completedOperations += 1
        setUploadProgress(Math.round((completedOperations / Math.max(1, operationCount)) * 100))
      }
      const operationProgress = (progress: number) => {
        //
        const completedShare = completedOperations / Math.max(1, operationCount)
        const currentShare = progress / 100 / Math.max(1, operationCount)
        setUploadProgress(Math.round((completedShare + currentShare) * 100))
      }

      for (const imageId of imageChanges.deletedImageIds) {
        if (currentImages.some((image) => image.id === imageId)) {
          currentImages = await deleteProductImage.mutateAsync({ productId, imageId })
        }
        remainingChanges = {
          ...remainingChanges,
          deletedImageIds: remainingChanges.deletedImageIds.filter((id) => id !== imageId),
        }
        advance()
      }

      for (const replacement of imageChanges.replacements) {
        if (!currentImages.some((image) => image.id === replacement.imageId)) {
          remainingChanges = removeMissingReplacement(remainingChanges, replacement.imageId)
          advance()
          continue
        }

        const beforeIds = new Set(currentImages.map((image) => image.id))
        currentImages = await replaceProductImage.mutateAsync({
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
            orderedImageIds:
              remainingChanges.orderedImageIds?.map((id) =>
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
        currentImages = await uploadProductImages.mutateAsync({
          productId,
          files: imageFiles,
          onProgress: operationProgress,
        })
        remainingFiles = []
        advance()
      }

      if (remainingChanges.orderedImageIds) {
        const desiredOrder = resolveDesiredImageOrder(
          currentImages,
          remainingChanges.orderedImageIds,
          idMap,
        )
        const orderChanged = desiredOrder.some((id, index) => currentImages[index]?.id !== id)
        if (desiredOrder.length > 0 && orderChanged) {
          currentImages = await reorderProductImages.mutateAsync({
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
        const primaryImage = currentImages.find((image) => image.id === primaryImageId)
        if (primaryImage && !primaryImage.isPrimary) {
          await setPrimaryProductImage.mutateAsync({ productId, imageId: primaryImageId })
        }
        remainingChanges = { ...remainingChanges, primaryImageId: undefined }
        advance()
      }

      toast.success(t('productImages.saveSuccess'))
      return true
    } catch (error) {
      onImageFilesChange(remainingFiles)
      onImageChangesChange(remainingChanges)
      const message = getApiErrorMessage(error, t, 'productImages.actionError')
      setImageUploadError(message)
      toast.error(message)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  return {
    persistProductImages,
    resetImagePersistence,
    isUploading,
    uploadProgress,
    imageUploadError,
  }
}
