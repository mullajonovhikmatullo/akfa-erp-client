import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSalesReport, useExpenseReport } from '@/entities/analytics';

export function useDailySeries(branchId: string | null) {
  const from = dayjs().subtract(13, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');
  const params = { period: 'day' as const, from, to, ...(branchId ? { branchId } : {}) };

  const { data: salesData } = useSalesReport(params);
  const { data: expenseData } = useExpenseReport(params);

  return useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = dayjs().subtract(13 - i, 'day');
      return { date: d.format('MMM DD'), iso: d.format('YYYY-MM-DD'), revenue: 0, expenses: 0 };
    });

    const byIso: Record<string, (typeof days)[0]> = Object.fromEntries(days.map((d) => [d.iso, d]));

    salesData?.byPeriod.forEach(({ period, totalRevenue }) => {
      if (byIso[period]) byIso[period].revenue = totalRevenue;
    });

    expenseData?.byPeriod.forEach(({ period, amount }) => {
      if (byIso[period]) byIso[period].expenses = amount;
    });

    return days;
  }, [salesData, expenseData]);
}
