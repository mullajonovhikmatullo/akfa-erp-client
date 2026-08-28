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

export interface StockReceipt {
  id: string
  receivedAt: string
  productCount: number
  pieceQuantity: number
  kgQuantity: number
  totalCostUzs: number
  remainingValueUzs: number
  supplierNote: string | null
  branch: { id: string; name: string }
  createdBy: { id: string; fullName: string }
}

export interface ReceiptPage {
  items: StockReceipt[]
  total: number
}

export interface ReceiptItemsPage {
  items: StockBatch[]
  total: number
}

export type ReceiptPageQuery = Pick<BatchFilters, 'branchId' | 'from' | 'to'> & {
  page: number
  pageSize: number
}

export type BatchPageQuery = BatchFilters & {
  page: number
  pageSize: number
}
