import type { PaymentMethod, SaleType, StockMovementType } from '@store/store-shared'

export type AnalyticsPeriod = 'day' | 'week' | 'month'

export interface AnalyticsQuery {
  branchId?: string
  from?: string
  to?: string
  period?: AnalyticsPeriod
  limit?: number
  lowStockThreshold?: number
}

export interface DashboardData {
  period: { from: string; to: string }
  sales: { totalRevenue: number; paidAmount: number; outstandingDebt: number; saleCount: number }
  expenses: { total: number }
  profit: { netProfit: number }
  inventory: { stockValueUzs: number; lowStockCount: number }
  customers: { totalDebt: number; debtorCount: number }
  transfers: { pendingCount: number }
}

export interface SalesReportData {
  period: { from: string; to: string }
  summary: {
    totalRevenue: number
    paidAmount: number
    outstandingDebt: number
    saleCount: number
    avgOrderValue: number
  }
  byPeriod: { period: string; saleCount: number; totalRevenue: number; paidAmount: number }[]
  byType: { saleType: SaleType; revenue: number; count: number }[]
  byPaymentMethod: { paymentMethod: PaymentMethod; amount: number; count: number }[]
  topProducts: {
    productId: string
    name: string
    sku: string | null
    unit: string
    totalQuantity: number
    totalRevenue: number
  }[]
}

export interface InventoryReportData {
  period: { from: string; to: string }
  stockByBranch: {
    branchId: string
    branchName: string
    productCount: number
    stockValueUzs: number
    totalQuantity: number
  }[]
  lowStock: {
    productId: string
    name: string
    sku: string | null
    unit: string
    currentStock: number
    threshold: number
    branchId: string
    branchName: string
  }[]
  movementSummary: { type: StockMovementType; totalQuantity: number; count: number }[]
}

export interface ExpenseReportData {
  period: { from: string; to: string }
  summary: { total: number; count: number }
  byCategory: { categoryId: string; categoryName: string; amount: number; count: number }[]
  byPeriod: { period: string; amount: number; count: number }[]
}

export interface CustomerDebtData {
  summary: { totalDebt: number; debtorCount: number }
  overdue: { totalOverdueDebt: number; overdueCount: number }
  topDebtors: {
    id: string
    fullName: string
    phone: string | null
    balance: number
    branch: { id: string; name: string }
  }[]
}
