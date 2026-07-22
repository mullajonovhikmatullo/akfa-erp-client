import { http } from '@erp/erp-shared'
import type { ApiResponse, InventoryRecord } from '@erp/erp-shared'
import type {
  CreateProductPayload,
  Product,
  ProductListParams,
  ProductPage,
  ProductPageQuery,
  ProductSummary,
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
  },
}

export const ProductFlowApi = {
  createProduct,
  updateProduct,
  deleteProduct,
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
}
