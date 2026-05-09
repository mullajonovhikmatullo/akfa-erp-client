import { MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import { useKpiData } from '../model/useKpiData';
import { KpiCard } from './KpiCard';
import { useDailySeries } from '@/widgets/revenue-chart/model/useDailySeries';

export function DashboardKpis() {
  const { isSuper, branchId } = useCurrentUser();
  const branchFilter = isSuper ? null : branchId;
  const series = useDailySeries(branchFilter);

  const {
    todayRevenue,
    todaySalesCount,
    monthRevenue,
    monthSalesCount,
    monthExpenseTotal,
    totalDebt,
    debtorCount,
  } = useKpiData(branchFilter);

  return (
    <div className="grid-4" style={{ marginBottom: 16 }}>
      <KpiCard
        label="Today · Revenue"
        value={<MoneyDisplay amount={todayRevenue} currency="UZS" compact />}
        delta={`${todaySalesCount} sales`}
        deltaUp
        hint="Real-time"
        sparkline={series.slice(-7).map((d) => d.revenue)}
      />
      <KpiCard
        label="This month · Revenue"
        value={<MoneyDisplay amount={monthRevenue} currency="UZS" compact />}
        delta={`${monthSalesCount} sales`}
        deltaUp
        hint="MTD"
        sparkline={series.map((d) => d.revenue)}
      />
      <KpiCard
        label="This month · Expenses"
        value={<MoneyDisplay amount={monthExpenseTotal} currency="UZS" compact />}
        delta="overhead"
        deltaUp={false}
        hint="MTD"
        sparkline={series.map((d) => d.expenses)}
      />
      <KpiCard
        label="Receivables"
        value={<MoneyDisplay amount={totalDebt} currency="UZS" compact />}
        delta={`${debtorCount} debtors`}
        deltaUp={false}
        hint="Outstanding"
      />
    </div>
  );
}
