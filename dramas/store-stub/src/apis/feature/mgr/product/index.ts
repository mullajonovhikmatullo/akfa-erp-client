import { http } from '@store/store-shared'
import type { ApiResponse, InventoryRecord } from '@store/store-shared'
import type {
  CreateProductPayload,
  Product,
  ProductImage,
  ProductListParams,
  ProductPage,
  ProductPageQuery,
  ProductSummary,
  ReorderProductImagesPayload,
  UpdateProductPayload,
} from '../../../../models/domain/product'

type Raw = Record<string, unknown>

const parseProduct = (raw: Raw): Product => ({
  ...(raw as unknown as Product),
  costPriceUzs: Number(raw.costPriceUzs),
  retailPriceUzs: Number(raw.retailPriceUzs),
  wholesalePriceUzs: Number(raw.wholesalePriceUzs),
  costPriceUsd: raw.costPriceUsd != null ? Number(raw.costPriceUsd) : null,
  retailPriceUsd: raw.retailPriceUsd != null ? Number(raw.retailPriceUsd) : null,
  wholesalePriceUsd: raw.wholesalePriceUsd != null ? Number(raw.wholesalePriceUsd) : null,
  categoryId: raw.category ? (raw.category as { id: string }).id : null,
  primaryImageUrl: (raw.primaryImageUrl as string | null | undefined) ?? null,
  primaryThumbnailUrl: (raw.primaryThumbnailUrl as string | null | undefined) ?? null,
  imageCount: Number(raw.imageCount ?? 0),
  images: Array.isArray(raw.images)
    ? raw.images.map((image) => parseProductImage(image as Raw))
    : undefined,
})

const parseProductImage = (raw: Raw): ProductImage => ({
  id: String(raw.id),
  productId: String(raw.productId),
  url: String(raw.url),
  thumbnailUrl: String(raw.thumbnailUrl),
  originalFilename: String(raw.originalFilename),
  mimeType: 'image/webp',
  fileSize: Number(raw.fileSize),
  width: Number(raw.width),
  height: Number(raw.height),
  isPrimary: Boolean(raw.isPrimary),
  sortOrder: Number(raw.sortOrder),
  createdAt: String(raw.createdAt),
  updatedAt: String(raw.updatedAt),
})

const parseInventoryRecord = (raw: Raw): InventoryRecord => ({
  ...(raw as unknown as InventoryRecord),
  quantity: Number(raw.quantity),
  product: {
    ...(raw.product as InventoryRecord['product']),
  },
})

const findProducts = (params?: ProductListParams) =>
  http.get<ApiResponse<Raw[]>>('/products', { params }).then((response) => response.data.data.map(parseProduct))

const findProductsPage = (params: ProductPageQuery): Promise<ProductPage> =>
  http
    .get<ApiResponse<{ items: Raw[]; total: number }>>('/products', { params })
    .then((response) => ({
      items: response.data.data.items.map(parseProduct),
      total: response.data.data.total,
    }))

const findProductSummary = (): Promise<ProductSummary> =>
  http.get<ApiResponse<ProductSummary>>('/products/summary').then((response) => ({
    totalActive: Number(response.data.data.totalActive),
    totalInactive: Number(response.data.data.totalInactive),
  }))

const findProduct = (id: string) => http.get<ApiResponse<Raw>>(`/products/${id}`).then((response) => parseProduct(response.data.data))

const createProduct = (payload: CreateProductPayload) =>
  http.post<ApiResponse<Raw>>('/products', payload).then((response) => parseProduct(response.data.data))

const updateProduct = ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
  http.patch<ApiResponse<Raw>>(`/products/${id}`, payload).then((response) => parseProduct(response.data.data))

const deleteProduct = (id: string) => http.delete(`/products/${id}`)

const findProductImages = (productId: string) =>
  http
    .get<ApiResponse<Raw[]>>(`/products/${productId}/images`)
    .then((response) => response.data.data.map(parseProductImage))

const imageFormData = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return formData
}

const uploadProductImages = (
  productId: string,
  files: File[],
  onProgress?: (progress: number) => void,
) =>
  http
    .post<ApiResponse<Raw[]>>(`/products/${productId}/images`, imageFormData(files), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      },
    })
    .then((response) => response.data.data.map(parseProductImage))

const replaceProductImage = ({
  productId,
  imageId,
  file,
  onProgress,
}: {
  productId: string
  imageId: string
  file: File
  onProgress?: (progress: number) => void
}) =>
  http
    .put<ApiResponse<Raw[]>>(
      `/products/${productId}/images/${imageId}`,
      imageFormData([file]),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return
          onProgress?.(Math.round((event.loaded / event.total) * 100))
        },
      },
    )
    .then((response) => response.data.data.map(parseProductImage))

const setPrimaryProductImage = ({ productId, imageId }: { productId: string; imageId: string }) =>
  http
    .patch<ApiResponse<Raw[]>>(`/products/${productId}/images/${imageId}/primary`)
    .then((response) => response.data.data.map(parseProductImage))

const reorderProductImages = ({
  productId,
  payload,
}: {
  productId: string
  payload: ReorderProductImagesPayload
}) =>
  http
    .patch<ApiResponse<Raw[]>>(`/products/${productId}/images/reorder`, payload)
    .then((response) => response.data.data.map(parseProductImage))

const deleteProductImage = ({ productId, imageId }: { productId: string; imageId: string }) =>
  http
    .delete<ApiResponse<Raw[]>>(`/products/${productId}/images/${imageId}`)
    .then((response) => response.data.data.map(parseProductImage))

const normalizeProductImageUrl = (url: string) =>
  url.startsWith('/api/') ? url.replace(/^\/api/, '') : url

const downloadProductImage = (url: string) =>
  http.get<Blob>(normalizeProductImageUrl(url), { responseType: 'blob' }).then((response) => response.data)

const findProductInventory = (productId: string) =>
  http
    .get<ApiResponse<Raw[]>>('/inventory', { params: { productId } })
    .then((response) => response.data.data.map(parseInventoryRecord))

export const ProductSeekApi = {
  findProducts,
  findProductsPage,
  findProductSummary,
  findProduct,
  findProductInventory,
  findProductImages,
  downloadProductImage,
  fetch: {
    findProducts: (params?: ProductListParams) => ({
      queryKey: ['products', 'findProducts', params ?? {}] as const,
      queryFn: () => findProducts(params),
    }),
    findProductsPage: (params: ProductPageQuery) => ({
      queryKey: ['products', 'paginated', params] as const,
      queryFn: () => findProductsPage(params),
    }),
    findProductSummary: () => ({
      queryKey: ['products', 'summary'] as const,
      queryFn: findProductSummary,
    }),
    findProduct: (id: string) => ({
      queryKey: ['products', 'detail', id] as const,
      queryFn: () => findProduct(id),
    }),
    findProductInventory: (productId: string) => ({
      queryKey: ['products', 'inventory', productId] as const,
      queryFn: () => findProductInventory(productId),
    }),
    findProductImages: (productId: string) => ({
      queryKey: ['products', 'images', productId] as const,
      queryFn: () => findProductImages(productId),
    }),
  },
}

export const ProductFlowApi = {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  replaceProductImage,
  setPrimaryProductImage,
  reorderProductImages,
  deleteProductImage,
}

export const productApi = {
  list: findProducts,
  listPaginated: findProductsPage,
  summary: findProductSummary,
  getById: findProduct,
  create: createProduct,
  update: (id: string, payload: UpdateProductPayload) => updateProduct({ id, payload }),
  remove: deleteProduct,
  getInventory: findProductInventory,
  images: findProductImages,
  uploadImages: uploadProductImages,
  replaceImage: replaceProductImage,
  setPrimaryImage: setPrimaryProductImage,
  reorderImages: reorderProductImages,
  deleteImage: deleteProductImage,
  downloadImage: downloadProductImage,
}
