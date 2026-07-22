import type { Transfer, TransferStatus } from '@erp/erp-shared'

export type { Transfer, TransferStatus }

export interface TransferFilters {
  branchId?: string
  status?: TransferStatus
  from?: string
  to?: string
  limit?: number
}

export interface CreateTransferPayload {
  fromBranchId?: string
  toBranchId: string
  items: { productId: string; quantity: number; unitCostUzs?: number }[]
  note?: string
}
