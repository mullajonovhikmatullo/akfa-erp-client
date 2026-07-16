import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AnalyticsQuery } from '../api/analytics.api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (q?: AnalyticsQuery) => [...analyticsKeys.all, 'dashboard', q] as const,
  sales: (q?: AnalyticsQuery) => [...analyticsKeys.all, 'sales', q] as const,
  inventory: (q?: AnalyticsQuery) => [...analyticsKeys.all, 'inventory', q] as const,
  expenses: (q?: AnalyticsQuery) => [...analyticsKeys.all, 'expenses', q] as const,
  customerDebt: (q?: AnalyticsQuery) => [...analyticsKeys.all, 'customerDebt', q] as const,
};

const liveAnalyticsQueryOptions = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
};

export function useDashboard(q?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(q),
    queryFn: () => analyticsApi.dashboard(q),
    ...liveAnalyticsQueryOptions,
  });
}

export function useSalesReport(q?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.sales(q),
    queryFn: () => analyticsApi.salesReport(q),
    ...liveAnalyticsQueryOptions,
  });
}

export function useInventoryReport(q?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.inventory(q),
    queryFn: () => analyticsApi.inventoryReport(q),
    ...liveAnalyticsQueryOptions,
  });
}

export function useExpenseReport(q?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.expenses(q),
    queryFn: () => analyticsApi.expenseReport(q),
    ...liveAnalyticsQueryOptions,
  });
}

export function useCustomerDebt(q?: AnalyticsQuery) {
  return useQuery({
    queryKey: analyticsKeys.customerDebt(q),
    queryFn: () => analyticsApi.customerDebt(q),
    ...liveAnalyticsQueryOptions,
  });
}
