import type { DebtPayment, PaymentMethod, SaleDetail, SaleListItem, SaleType } from '@store/store-shared'
import type { AddPaymentRequest, CreateSaleRequest } from '../../../contracts/backend.generated'

export type { DebtPayment, PaymentMethod, SaleDetail, SaleListItem, SaleType }

export interface SaleFilters {
  branchId?: string
  customerId?: string
  saleType?: SaleType
  hasDebt?: boolean
  overdue?: boolean
  from?: string
  to?: string
  limit?: number
}

export interface SalePage {
  items: SaleListItem[]
  total: number
  totalWithDebt: number
}

export interface SalePageQuery extends SaleFilters {
  page: number
  pageSize: number
}

export interface DebtPaymentFilters {
  branchId?: string
  customerId?: string
  paymentMethod?: PaymentMethod
  from?: string
  to?: string
  page: number
  pageSize: number
}

export interface DebtPaymentPage {
  items: DebtPayment[]
  total: number
  page: number
  pageSize: number
}

export type CreateSalePayload = CreateSaleRequest & { debtDueDate?: string | null }

export type AddPaymentPayload = AddPaymentRequest
