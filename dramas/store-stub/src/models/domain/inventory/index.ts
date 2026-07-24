import type { InventoryRecord, StockBatch } from '@store/store-shared'
import type { StockInRequest } from '../../../contracts/backend.generated'

export type { InventoryRecord, StockBatch }

export type StockInPayload = StockInRequest

export interface BatchFilters {
  branchId?: string
  productId?: string
  depleted?: boolean
  from?: string
  to?: string
}

export interface InventoryFilters {
  branchId?: string
  productId?: string
  categoryId?: string
  lowStock?: boolean
}

export interface BatchPage {
  items: StockBatch[]
  total: number
  totalBatches: number
  totalActive: number
  totalCostUzs: number
  totalRemainingValueUzs: number
}

export interface BatchSummary {
  totalBatches: number
  totalActive: number
  totalCostUzs: number
  totalRemainingValueUzs: number
}

export type BatchPageQuery = BatchFilters & {
  page: number
  pageSize: number
}
