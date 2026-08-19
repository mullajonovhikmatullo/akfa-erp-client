import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFlowApi, ProductSeekApi } from '@store/store-stub'
import type { ProductListParams, UpdateProductPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'

type Translate = (key: string) => string

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductListParams) => ['products', 'list', filters ?? {}] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  inventory: (productId: string) => ['products', 'inventory', productId] as const,
  summary: () => ['products', 'summary'] as const,
}

export function useProducts(filters?: ProductListParams) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProducts(filters)

  return useQuery({ queryKey, queryFn })
}

export function useProductsPage(params: ProductListParams & { page: number; pageSize: number }) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductsPage(params)

  return useQuery({ queryKey, queryFn })
}

export function useProductSummary() {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductSummary()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductDetail(id: string | null) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProduct(id ?? '')

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(id),
  })
}

export function useProductInventory(productId: string | null) {
  //
  const { queryKey, queryFn } = ProductSeekApi.fetch.findProductInventory(productId ?? '')

  return useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(productId),
    staleTime: 30_000,
  })
}

export function useCreateProduct(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ProductFlowApi.createProduct,
    onSuccess: (product) => {
      //
      toast.success(t('products.createSuccess').replace('{name}', product.name))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'products.createError'))
    },
  })
}

export function useUpdateProduct(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => ProductFlowApi.updateProduct({ id, payload }),
    onSuccess: (product) => {
      //
      toast.success(t('products.updateSuccess').replace('{name}', product.name))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'products.updateError'))
    },
  })
}

export function useDeleteProduct(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ProductFlowApi.deleteProduct,
    onSuccess: async () => {
      //
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(t('products.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'products.deleteError'))
    },
  })
}
