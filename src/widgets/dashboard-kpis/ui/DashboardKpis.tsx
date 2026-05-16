import { MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import { useKpiData } from '../model/useKpiData';
import { KpiCard } from './KpiCard';
import { useDailySeries } from '@/widgets/revenue-chart/model/useDailySeries';
import { useT } from '@/shared/lib/i18n';

export function DashboardKpis() {
  const t = useT();
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
        label={t('dashboard.kpiTodayRevenue')}
        value={<MoneyDisplay amount={todayRevenue} currency="UZS" compact />}
        delta={`${todaySalesCount} ${t('dashboard.kpiTodaySalesSuffix')}`}
        deltaUp
        hint={t('dashboard.kpiTodayHint')}
        sparkline={series.slice(-7).map((d) => d.revenue)}
      />
      <KpiCard
        label={t('dashboard.kpiMonthRevenue')}
        value={<MoneyDisplay amount={monthRevenue} currency="UZS" compact />}
        delta={`${monthSalesCount} ${t('dashboard.kpiTodaySalesSuffix')}`}
        deltaUp
        hint={t('dashboard.kpiMonthHint')}
        sparkline={series.map((d) => d.revenue)}
      />
      <KpiCard
        label={t('dashboard.kpiMonthExpenses')}
        value={<MoneyDisplay amount={monthExpenseTotal} currency="UZS" compact />}
        delta={t('dashboard.kpiMonthExpensesDelta')}
        deltaUp={false}
        hint={t('dashboard.kpiMonthHint')}
        sparkline={series.map((d) => d.expenses)}
      />
      <KpiCard
        label={t('dashboard.kpiDebt')}
        value={<MoneyDisplay amount={totalDebt} currency="UZS" compact />}
        delta={`${debtorCount} ${t('dashboard.kpiDebtorSuffix')}`}
        deltaUp={false}
        hint={t('dashboard.kpiDebtHint')}
      />
    </div>
  );
}
