import dayjs from 'dayjs';
import { useDashboard } from '@/entities/analytics';

export function useKpiData(branchId?: string | null) {
  const today = dayjs().format('YYYY-MM-DD');
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');

  const params = branchId ? { branchId } : undefined;

  const { data: todayData } = useDashboard({ ...params, from: today, to: today });
  const { data: monthData } = useDashboard({ ...params, from: monthStart, to: today });

  return {
    todayRevenue: todayData?.sales.totalRevenue ?? 0,
    todaySalesCount: todayData?.sales.saleCount ?? 0,
    monthRevenue: monthData?.sales.totalRevenue ?? 0,
    monthSalesCount: monthData?.sales.saleCount ?? 0,
    monthExpenseTotal: monthData?.expenses.total ?? 0,
    totalDebt: monthData?.customers.totalDebt ?? 0,
    debtorCount: monthData?.customers.debtorCount ?? 0,
  };
}
