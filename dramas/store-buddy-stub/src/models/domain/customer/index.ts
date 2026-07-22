import type { Customer, RecentSale } from '@erp/erp-shared'

export type { Customer, RecentSale }

export interface CustomerFilters {
  search?: string
  branchId?: string
  isActive?: boolean
  hasDebt?: boolean
}

export interface CreateCustomerPayload {
  fullName: string
  phone?: string | null
  address?: string | null
  branchId?: string
  balance?: number
}

export interface UpdateCustomerPayload {
  fullName?: string
  phone?: string | null
  address?: string | null
  isActive?: boolean
}

export interface CustomerDetail extends Customer {
  recentSales: RecentSale[]
}
