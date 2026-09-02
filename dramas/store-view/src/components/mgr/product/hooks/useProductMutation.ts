import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFlowApi } from '@store/store-stub'
import type { UpdateProductPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { productKeys } from './productKeys'

type Translate = (key: string) => string

export function useProductMutation(t: Translate) {
  //
  const queryClient = useQueryClient()

  const createProduct = useMutation({
    mutationFn: ProductFlowApi.createProduct,
    onSuccess: (product) => {
      //
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(t('products.createSuccess').replace('{name}', product.name))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.createError')),
  })

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => ProductFlowApi.updateProduct({ id, payload }),
    onSuccess: (product) => {
      //
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(t('products.updateSuccess').replace('{name}', product.name))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.updateError')),
  })

  const deleteProduct = useMutation({
    mutationFn: ProductFlowApi.deleteProduct,
    onSuccess: async () => {
      //
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(t('products.deleteSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'products.deleteError')),
  })

  return { createProduct, updateProduct, deleteProduct }
}
