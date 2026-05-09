export { analyticsApi } from './api/analytics.api';
export type {
  AnalyticsQuery,
  AnalyticsPeriod,
  DashboardData,
  SalesReportData,
  InventoryReportData,
  ExpenseReportData,
  CustomerDebtData,
} from './api/analytics.api';
export {
  analyticsKeys,
  useDashboard,
  useSalesReport,
  useInventoryReport,
  useExpenseReport,
  useCustomerDebt,
} from './model/analytics.queries';
