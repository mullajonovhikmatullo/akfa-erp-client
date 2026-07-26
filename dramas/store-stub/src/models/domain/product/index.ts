import type { Currency, Product, ProductImage } from '@store/store-shared'
import type {
  CreateProductRequest,
  ProductUnit,
  ReorderProductImagesRequest,
  UpdateProductRequest,
} from '../../../contracts/backend.generated'

export type { Product, ProductImage, ProductUnit, Currency }

export interface ProductListParams {
  search?: string
  categoryId?: string
  unit?: ProductUnit
  isActive?: boolean
  priceCurrency?: Currency
}

export type CreateProductPayload = CreateProductRequest

export type UpdateProductPayload = UpdateProductRequest

export type ReorderProductImagesPayload = ReorderProductImagesRequest

export interface ProductPage {
  items: Product[]
  total: number
}

export interface ProductSummary {
  totalActive: number
  totalInactive: number
}

export type ProductPageQuery = ProductListParams & {
  page: number
  pageSize: number
}
