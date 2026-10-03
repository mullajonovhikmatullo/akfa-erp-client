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

export type CustomerPhoneMatch = Pick<Customer, 'id' | 'fullName' | 'phone' | 'branch'>

export type CustomerPhoneCheckResult =
  | { customer: null; linkedToBranch: false; normalizedPhone: string | null }
  | { customer: Customer; linkedToBranch: true; normalizedPhone: string | null }
  | { customer: CustomerPhoneMatch; linkedToBranch: false; normalizedPhone: string | null }
