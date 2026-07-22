import type { PaymentMethod, SaleDetail, SaleListItem, SaleType } from '@erp/erp-shared'

export type { PaymentMethod, SaleDetail, SaleListItem, SaleType }

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

export interface CreateSalePayload {
  branchId?: string
  customerId?: string
  saleType: SaleType
  items: { productId: string; quantity: number }[]
  paidAmountUzs?: number
  paidAmountUsd?: number
  usdToUzsRate?: number
  paymentMethod: PaymentMethod
  debtDueDate?: string | null
  note?: string
}

export interface AddPaymentPayload {
  amountUzs?: number
  amountUsd?: number
  usdToUzsRate?: number
  paymentMethod: PaymentMethod
  note?: string
}
