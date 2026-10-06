import type { Transfer, TransferStatus } from '@store/store-shared'
import type { CreateTransferRequest } from '../../../contracts/backend.generated'

export type { Transfer, TransferStatus }

export interface TransferFilters {
  branchId?: string
  status?: TransferStatus
  from?: string
  to?: string
  limit?: number
}

export type TransferSummary = Omit<Transfer, 'items' | 'updatedAt' | 'completedBy'> & {
  itemCount: number
  totalCostUzs: number
}

export interface TransferPageQuery extends Omit<TransferFilters, 'limit'> {
  page: number
  pageSize: number
}

export interface TransferPage {
  items: TransferSummary[]
  total: number
  pendingCount: number
}

export type CreateTransferPayload = CreateTransferRequest
