import type { Branch } from '@store/store-shared'
import type { CreateBranchDto } from '../../../contracts/backend.generated'

export type { Branch }

export type BranchPayload = CreateBranchDto

export interface BranchPage {
  items: Branch[]
  total: number
}

export interface BranchPageQuery {
  page: number
  pageSize: number
}
