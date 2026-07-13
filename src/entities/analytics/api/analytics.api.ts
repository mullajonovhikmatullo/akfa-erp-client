import { apiClient } from '@/shared/api/client';
import type { PaymentMethod, SaleType, StockMovementType } from '@/shared/types/domain';

export type AnalyticsPeriod = 'day' | 'week' | 'month';

export interface AnalyticsQuery {
  branchId?: string;
  from?: string;
  to?: string;
  period?: AnalyticsPeriod;
  limit?: number;
  lowStockThreshold?: number;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardData {
  period: { from: string; to: string };
  sales: { totalRevenue: number; paidAmount: number; outstandingDebt: number; saleCount: number };
  expenses: { total: number };
  profit: { netProfit: number };
  inventory: { stockValueUzs: number; lowStockCount: number };
  customers: { totalDebt: number; debtorCount: number };
  transfers: { pendingCount: number };
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export interface SalesReportData {
  period: { from: string; to: string };
  summary: {
    totalRevenue: number;
    paidAmount: number;
    outstandingDebt: number;
    saleCount: number;
    avgOrderValue: number;
  };
  byPeriod: { period: string; saleCount: number; totalRevenue: number; paidAmount: number }[];
  byType: { saleType: SaleType; revenue: number; count: number }[];
  byPaymentMethod: { paymentMethod: PaymentMethod; amount: number; count: number }[];
  topProducts: {
    productId: string;
    name: string;
    sku: string | null;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryReportData {
  period: { from: string; to: string };
  stockByBranch: {
    branchId: string;
    branchName: string;
    productCount: number;
    stockValueUzs: number;
    totalQuantity: number;
  }[];
  lowStock: {
    productId: string;
    name: string;
    sku: string | null;
    unit: string;
    currentStock: number;
    threshold: number;
    branchId: string;
    branchName: string;
  }[];
  movementSummary: { type: StockMovementType; totalQuantity: number; count: number }[];
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export interface ExpenseReportData {
  period: { from: string; to: string };
  summary: { total: number; count: number };
  byCategory: { categoryId: string; categoryName: string; amount: number; count: number }[];
  byPeriod: { period: string; amount: number; count: number }[];
}

// ─── Customer Debt ────────────────────────────────────────────────────────────

export interface CustomerDebtData {
  summary: { totalDebt: number; debtorCount: number };
  overdue: { totalOverdueDebt: number; overdueCount: number };
  topDebtors: {
    id: string;
    fullName: string;
    phone: string | null;
    balance: number;
    branch: { id: string; name: string };
  }[];
}

export const analyticsApi = {
  dashboard: (params?: AnalyticsQuery) =>
    apiClient.get('/analytics/dashboard', { params }).then((r) => r.data.data as DashboardData),

  salesReport: (params?: AnalyticsQuery) =>
    apiClient.get('/analytics/sales', { params }).then((r) => r.data.data as SalesReportData),

  inventoryReport: (params?: AnalyticsQuery) =>
    apiClient.get('/analytics/inventory', { params }).then((r) => r.data.data as InventoryReportData),

  expenseReport: (params?: AnalyticsQuery) =>
    apiClient.get('/analytics/expenses', { params }).then((r) => r.data.data as ExpenseReportData),

  customerDebt: (params?: AnalyticsQuery) =>
    apiClient.get('/analytics/customers/debt', { params }).then((r) => r.data.data as CustomerDebtData),
};
