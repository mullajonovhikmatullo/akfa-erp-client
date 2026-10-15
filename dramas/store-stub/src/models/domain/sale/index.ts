import type { DebtPayment, PaymentMethod, ProductUnit, SaleDetail, SaleListItem, SaleType } from '@store/store-shared'
import type { AddPaymentRequest, CreateSaleRequest, SaleSettings } from '../../../contracts/backend.generated'

export type { DebtPayment, PaymentMethod, SaleDetail, SaleListItem, SaleSettings, SaleType }

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

export interface SaleReportQuery {
  branchId?: string
  customerId?: string
  saleType?: SaleType
  hasDebt?: boolean
  from: string
  to: string
  tz?: string
  includeSales?: boolean
}

export interface SaleReportMethodRow {
  paymentMethod: PaymentMethod
  amountUzs: number
  count: number
}

export interface SaleReportSummary {
  salesCount: number
  itemsQuantity: number
  listTotalUzs: number
  discountUzs: number
  totalUzs: number
  paidUzs: number
  debtUzs: number
  debtCollectedUzs: number
  receivedUzs: number
}

export interface SaleReportDay {
  day: string
  salesCount: number
  totalUzs: number
  discountUzs: number
  paidUzs: number
  debtUzs: number
}

export interface SaleReportSeller {
  id: string
  fullName: string
  salesCount: number
  totalUzs: number
}

export interface SaleReportProduct {
  id: string
  name: string
  sku: string | null
  unit: ProductUnit
  quantity: number
  totalUzs: number
}

export interface SaleReport {
  from: string
  to: string
  tz: string
  summary: SaleReportSummary
  payments: SaleReportMethodRow[]
  debtCollections: SaleReportMethodRow[]
  byDay: SaleReportDay[]
  bySeller: SaleReportSeller[]
  topProducts: SaleReportProduct[]
  sales: SaleListItem[] | null
  salesTruncated: boolean
}

export type CreateSalePayload = CreateSaleRequest & { debtDueDate?: string | null }

export type AddPaymentPayload = AddPaymentRequest
