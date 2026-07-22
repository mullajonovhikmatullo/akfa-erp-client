import type { Currency, Product, ProductUnit } from '@erp/erp-shared'

export type { Product, ProductUnit, Currency }

export interface ProductListParams {
  search?: string
  categoryId?: string
  unit?: ProductUnit
  isActive?: boolean
  priceCurrency?: Currency
}

export interface CreateProductPayload {
  name: string
  description?: string
  sku?: string
  unit: ProductUnit
  categoryId?: string
  branchId?: string
  costPriceUzs: number
  retailPriceUzs: number
  wholesalePriceUzs: number
  costPriceUsd?: number
  retailPriceUsd?: number
  wholesalePriceUsd?: number
}

export type UpdateProductPayload = Partial<CreateProductPayload> & { isActive?: boolean }

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
