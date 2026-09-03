import type { StoreTranslator } from '@store/store-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFlowApi } from '@store/store-stub'
import type { ReorderProductImagesPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { analyticsKeys } from '../../analytics/hooks/analyticsKeys'
import { inventoryKeys } from '../../inventory/hooks/inventoryKeys'
import { productKeys } from './productKeys'

type Translate = StoreTranslator

interface ProductMutationOptions {
  showCreateSuccess?: boolean
}

export function useProductMutation(t: Translate, { showCreateSuccess = true }: ProductMutationOptions = {}) {
  //
  const queryClient = useQueryClient()
  const invalidateProductData = () => {
    //
    queryClient.invalidateQueries({ queryKey: productKeys.all })
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
  }

  const createProduct = useMutation({
    mutationFn: ProductFlowApi.createProduct,
    onSuccess: (product) => {
      //
      invalidateProductData()
      if (showCreateSuccess) toast.success(t('products.createSuccess', { name: product.name }))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.createError')),
  })

  const updateProduct = useMutation({
    mutationFn: ProductFlowApi.updateProduct,
    onSuccess: (product) => {
      //
      invalidateProductData()
      toast.success(t('products.updateSuccess', { name: product.name }))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.updateError')),
  })

  const deleteProduct = useMutation({
    mutationFn: ProductFlowApi.deleteProduct,
    onSuccess: async () => {
      //
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
      ])
      toast.success(t('products.deleteSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.deleteError')),
  })

  const uploadProductImages = useMutation({
    mutationFn: ({
      productId,
      files,
      onProgress,
    }: {
      productId: string
      files: File[]
      onProgress?: (progress: number) => void
    }) => ProductFlowApi.uploadProductImages(productId, files, onProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  const replaceProductImage = useMutation({
    mutationFn: ({
      productId,
      imageId,
      file,
      onProgress,
    }: {
      productId: string
      imageId: string
      file: File
      onProgress?: (progress: number) => void
    }) => ProductFlowApi.replaceProductImage({ productId, imageId, file, onProgress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  const setPrimaryProductImage = useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      ProductFlowApi.setPrimaryProductImage({ productId, imageId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  const reorderProductImages = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string
      payload: ReorderProductImagesPayload
    }) => ProductFlowApi.reorderProductImages({ productId, payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  const deleteProductImage = useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      ProductFlowApi.deleteProductImage({ productId, imageId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    replaceProductImage,
    setPrimaryProductImage,
    reorderProductImages,
    deleteProductImage,
  }
}
