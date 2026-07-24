import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProductFlowApi, ProductSeekApi } from '@store/store-stub'
import type { ProductListParams, UpdateProductPayload } from '@store/store-stub'

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

export function useCreateProduct() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ProductFlowApi.createProduct,
    onSuccess: (product) => {
      //
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(`"${product.name}" mahsulot qo'shildi`)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      //
      toast.error(error.response?.data?.message ?? "Mahsulot qo'shishda xato")
    },
  })
}

export function useUpdateProduct() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => ProductFlowApi.updateProduct({ id, payload }),
    onSuccess: (product) => {
      //
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(`"${product.name}" yangilandi`)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      //
      toast.error(error.response?.data?.message ?? 'Yangilashda xato')
    },
  })
}

export function useDeleteProduct() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ProductFlowApi.deleteProduct,
    onSuccess: async () => {
      //
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success("Mahsulot o'chirildi")
    },
    onError: () => {
      //
      toast.error("O'chirishda xato yuz berdi")
    },
  })
}
