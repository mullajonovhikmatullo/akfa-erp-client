import type { InventoryRecord, StockBatch } from '@erp/erp-shared'

export type { InventoryRecord, StockBatch }

export interface StockInPayload {
  branchId?: string
  productId: string
  quantity: number
  costPriceUzs: number
  costPriceUsd?: number
}

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
