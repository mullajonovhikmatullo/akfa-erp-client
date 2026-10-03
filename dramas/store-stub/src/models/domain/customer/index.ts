import type { Customer, ProductUnit, RecentSale } from '@store/store-shared'
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

export interface CustomerScopeQuery {
  branchId?: string
}

export interface CustomerMonthlyPurchase {
  month: string
  salesCount: number
  totalAmountUzs: number
  paidAmountUzs: number
}

export interface CustomerSummary {
  customerId: string
  balanceScope: 'store' | 'branch'
  balance: number
  salesCount: number
  totalAmountUzs: number
  paidAmountUzs: number
  debtAmountUzs: number
  averageSaleUzs: number
  openDebtCount: number
  overdueDebtUzs: number
  overdueCount: number
  debtPaymentsUzs: number
  debtPaymentCount: number
  productCount: number
  firstSaleAt: string | null
  lastSaleAt: string | null
  monthly: CustomerMonthlyPurchase[]
}

export interface CustomerPurchasedProduct {
  productId: string
  name: string
  sku: string | null
  unit: ProductUnit
  quantity: number
  totalAmountUzs: number
  purchaseCount: number
  lastPurchasedAt: string
  primaryThumbnailUrl: string | null
}

export type CustomerProductsPageQuery = CustomerScopeQuery & {
  page: number
  pageSize: number
}

export interface CustomerProductsPage {
  items: CustomerPurchasedProduct[]
  total: number
}
