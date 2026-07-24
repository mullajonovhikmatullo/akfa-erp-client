import type { Customer, RecentSale } from '@store/store-shared'
import type { CreateCustomerRequest, UpdateCustomerRequest } from '../../../contracts/backend.generated'

export type { Customer, RecentSale }

export interface CustomerFilters {
  search?: string
  branchId?: string
  isActive?: boolean
  hasDebt?: boolean
}

export type CreateCustomerPayload = CreateCustomerRequest

export type UpdateCustomerPayload = UpdateCustomerRequest

export interface CustomerDetail extends Customer {
  recentSales: RecentSale[]
}
