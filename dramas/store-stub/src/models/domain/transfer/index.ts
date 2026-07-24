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

export type CreateTransferPayload = CreateTransferRequest
