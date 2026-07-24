import type { Currency, Product } from '@store/store-shared'
import type { CreateProductRequest, ProductUnit, UpdateProductRequest } from '../../../contracts/backend.generated'

export type { Product, ProductUnit, Currency }

export interface ProductListParams {
  search?: string
  categoryId?: string
  unit?: ProductUnit
  isActive?: boolean
  priceCurrency?: Currency
}

export type CreateProductPayload = CreateProductRequest

export type UpdateProductPayload = UpdateProductRequest

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
