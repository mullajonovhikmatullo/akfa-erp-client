import { useQuery } from '@tanstack/react-query'
import { AnalyticsSeekApi } from '@erp/store-buddy-stub'
import type { AnalyticsQuery } from '@erp/store-buddy-stub'

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'dashboard', query] as const,
  sales: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'sales', query] as const,
  inventory: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'inventory', query] as const,
  expenses: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'expenses', query] as const,
  customerDebt: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'customerDebt', query] as const,
}

const liveAnalyticsQueryOptions = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
}

export function useDashboard(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.dashboard(query)

  return useQuery({
    queryKey,
    queryFn,
    ...liveAnalyticsQueryOptions,
  })
}

export function useSalesReport(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.salesReport(query)

  return useQuery({
    queryKey,
    queryFn,
    ...liveAnalyticsQueryOptions,
  })
}

export function useInventoryReport(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.inventoryReport(query)

  return useQuery({
    queryKey,
    queryFn,
    ...liveAnalyticsQueryOptions,
  })
}

export function useExpenseReport(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.expenseReport(query)

  return useQuery({
    queryKey,
    queryFn,
    ...liveAnalyticsQueryOptions,
  })
}

export function useCustomerDebt(query?: AnalyticsQuery) {
  //
  const { queryKey, queryFn } = AnalyticsSeekApi.fetch.customerDebt(query)

  return useQuery({
    queryKey,
    queryFn,
    ...liveAnalyticsQueryOptions,
  })
}
