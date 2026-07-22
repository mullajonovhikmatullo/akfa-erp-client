import { Bell, Headset, Storefront, Wallet } from '@phosphor-icons/react';
import { ErrorState } from '../common/ErrorState';
import { LoadingCard } from '../common/LoadingCard';
import { formatCompactCurrencyUZS } from '../../lib/formatters';
import { CalendarCard } from './CalendarCard';
import { DashboardGrid } from './DashboardGrid';
import { GlobalAdminProfileCard } from './GlobalAdminProfileCard';
import { MetricCard } from './MetricCard';
import { RevenueChartCard } from './RevenueChartCard';
import { SystemAnnouncementsCard } from './SystemAnnouncementsCard';
import { TenantListCard } from './TenantListCard';
import { TodayEventsCard } from './TodayEventsCard';
import { TodayRenewalsCard } from './TodayRenewalsCard';
import { UpcomingPaymentsCard } from './UpcomingPaymentsCard';
import { useDashboardData } from './hooks/useDashboardData';

const DashboardSkeleton = () => (
  <DashboardGrid>
    <div className="dashboard-top-grid">
      <LoadingCard className="profile-card" rows={6} />
      <LoadingCard className="metric-revenue" compact rows={3} />
      <LoadingCard className="metric-tenants" compact rows={3} />
      <LoadingCard className="metric-alerts" compact rows={3} />
      <LoadingCard className="metric-stores" compact rows={2} />
      <LoadingCard className="metric-requests" compact rows={2} />
      <LoadingCard className="metric-health" compact rows={2} />
      <LoadingCard className="calendar-card" rows={6} />
    </div>
    <div className="dashboard-second-row">
      <LoadingCard rows={5} />
      <LoadingCard rows={6} />
      <LoadingCard rows={4} />
    </div>
    <div className="dashboard-third-row">
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
    </div>
  </DashboardGrid>
);

export const GlobalAdminDashboardView = () => {
  //
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="dashboard-grid">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <DashboardGrid>
      <div className="dashboard-top-grid">
        <GlobalAdminProfileCard admin={data.admin} />

        <MetricCard
          className="metric-revenue"
          title="Oylik daromad"
          value={formatCompactCurrencyUZS(data.revenue.amount)}
          description="bu oy"
          change={data.revenue.monthlyChange}
          changeLabel="bu oy"
          progress={data.revenue.progress}
          accent="primary"
          icon={Wallet}
        />

        <MetricCard
          className="metric-tenants"
          title="Faol mijozlar"
          value={`${data.tenants.active}`}
          description="bu hafta"
          change={data.tenants.weeklyChange}
          changeLabel="bu hafta"
          progress={data.tenants.progress}
          accent="success"
          icon={Storefront}
        />

        <MetricCard
          className="metric-alerts"
          title="To‘lovlar va ogohlantirishlar"
          value={`${data.payments.dueSoon}`}
          description="To‘lov muddati yaqin"
          accent="warning"
          icon={Bell}
        />

        <MetricCard
          className="metric-stores metric-card--compact"
          title="Faol do‘konlar"
          value={`${data.tenants.totalStores}`}
          description="Tizimdan foydalanmoqda"
          accent="purple"
          icon={Storefront}
        />

        <MetricCard
          className="metric-requests metric-card--compact"
          title="Yangi murojaatlar"
          value={`${data.support.newRequests}`}
          description="Ko‘rib chiqilmagan"
          accent="danger"
          icon={Headset}
        />

        <MetricCard
          className="metric-health metric-card--compact"
          title="Tizim holati"
          value={`${data.platform.health}%`}
          description="Barqaror ishlamoqda"
          accent="success"
          icon={Storefront}
        >
          <div className="health-indicators" aria-label="Tizim holati ko‘rsatkichlari">
            {data.platform.statusIndicators.map((indicator, index) => (
              <span
                key={`${indicator}-${index}`}
                className="health-indicators__bar"
                style={{ transform: `scaleY(${indicator})` }}
              />
            ))}
          </div>
        </MetricCard>

        <CalendarCard selectedCalendarDay={data.selectedCalendarDay} />
      </div>

      <div className="dashboard-second-row">
        <TodayRenewalsCard renewals={data.renewals} />
        <RevenueChartCard data={data.revenueActivity} />
        <TodayEventsCard events={data.todayEvents} />
      </div>

      <div className="dashboard-third-row">
        <TenantListCard tenants={data.tenants.companies} />
        <UpcomingPaymentsCard payments={data.payments.upcoming} />
        <SystemAnnouncementsCard announcements={data.announcements} />
      </div>
    </DashboardGrid>
  );
};
