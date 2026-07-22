import type { Branch } from '@erp/erp-shared'

export type { Branch }

export interface BranchPayload {
  name: string
  address?: string | null
  phone?: string | null
}

export interface BranchPage {
  items: Branch[]
  total: number
}

export interface BranchPageQuery {
  page: number
  pageSize: number
}
