import { http } from '@store/store-shared'
import type {
  AnalyticsQuery,
  CustomerDebtData,
  DashboardData,
  ExpenseReportData,
  InventoryReportData,
  SalesReportData,
} from '../../../../models/domain/analytics'

const dashboard = (params?: AnalyticsQuery) =>
  http.get('/analytics/dashboard', { params }).then((response) => response.data.data as DashboardData)

const salesReport = (params?: AnalyticsQuery) =>
  http.get('/analytics/sales', { params }).then((response) => response.data.data as SalesReportData)

const inventoryReport = (params?: AnalyticsQuery) =>
  http.get('/analytics/inventory', { params }).then((response) => response.data.data as InventoryReportData)

const expenseReport = (params?: AnalyticsQuery) =>
  http.get('/analytics/expenses', { params }).then((response) => response.data.data as ExpenseReportData)

const customerDebt = (params?: AnalyticsQuery) =>
  http.get('/analytics/customers/debt', { params }).then((response) => response.data.data as CustomerDebtData)

export const AnalyticsSeekApi = {
  dashboard,
  salesReport,
  inventoryReport,
  expenseReport,
  customerDebt,
  fetch: {
    dashboard: (params?: AnalyticsQuery) => ({
      queryKey: ['analytics', 'dashboard', params] as const,
      queryFn: () => dashboard(params),
    }),
    salesReport: (params?: AnalyticsQuery) => ({
      queryKey: ['analytics', 'sales', params] as const,
      queryFn: () => salesReport(params),
    }),
    inventoryReport: (params?: AnalyticsQuery) => ({
      queryKey: ['analytics', 'inventory', params] as const,
      queryFn: () => inventoryReport(params),
    }),
    expenseReport: (params?: AnalyticsQuery) => ({
      queryKey: ['analytics', 'expenses', params] as const,
      queryFn: () => expenseReport(params),
    }),
    customerDebt: (params?: AnalyticsQuery) => ({
      queryKey: ['analytics', 'customerDebt', params] as const,
      queryFn: () => customerDebt(params),
    }),
  },
}

export const analyticsApi = {
  dashboard,
  salesReport,
  inventoryReport,
  expenseReport,
  customerDebt,
}
