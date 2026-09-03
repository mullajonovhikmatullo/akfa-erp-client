import type { AnalyticsQuery } from '@store/store-stub'

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'dashboard', query] as const,
  sales: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'sales', query] as const,
  inventory: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'inventory', query] as const,
  expenses: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'expenses', query] as const,
  customerDebt: (query?: AnalyticsQuery) => [...analyticsKeys.all, 'customerDebt', query] as const,
}
