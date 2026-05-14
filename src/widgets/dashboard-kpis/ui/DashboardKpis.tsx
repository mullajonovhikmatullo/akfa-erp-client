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
        label="Бугун · Даромад"
        value={<MoneyDisplay amount={todayRevenue} currency="UZS" compact />}
        delta={`${todaySalesCount} та сотув`}
        deltaUp
        hint="Жорий"
        sparkline={series.slice(-7).map((d) => d.revenue)}
      />
      <KpiCard
        label="Ой · Даромад"
        value={<MoneyDisplay amount={monthRevenue} currency="UZS" compact />}
        delta={`${monthSalesCount} та сотув`}
        deltaUp
        hint="ОТБ"
        sparkline={series.map((d) => d.revenue)}
      />
      <KpiCard
        label="Ой · Харажатлар"
        value={<MoneyDisplay amount={monthExpenseTotal} currency="UZS" compact />}
        delta="умумий харажат"
        deltaUp={false}
        hint="ОТБ"
        sparkline={series.map((d) => d.expenses)}
      />
      <KpiCard
        label="Дебиторлик"
        value={<MoneyDisplay amount={totalDebt} currency="UZS" compact />}
        delta={`${debtorCount} та қарздор`}
        deltaUp={false}
        hint="Тўланмаган"
      />
    </div>
  );
}
