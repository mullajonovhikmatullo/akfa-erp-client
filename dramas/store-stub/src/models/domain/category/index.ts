import type { Category } from '@store/store-shared'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../../../contracts/backend.generated'

export type { Category }

export type CreateCategoryPayload = CreateCategoryRequest

export type UpdateCategoryPayload = UpdateCategoryRequest

export interface CategoryPage {
  items: Category[]
  total: number
}

export interface CategorySummary {
  totalActive: number
  totalInactive: number
}

export interface CategoryPageQuery {
  page: number
  pageSize: number
  isActive?: boolean
}
