import type { Category } from '@erp/erp-shared'

export type { Category }

export interface CreateCategoryPayload {
  name: string
  description?: string
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload> & { isActive?: boolean }

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
