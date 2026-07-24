import { PlatformSeekApi } from '@store/platform-stub';
import type {
  PlatformDashboardResponse,
  PlatformPayment,
  PlatformStore,
  PlatformStoresResponse,
} from '@store/platform-stub';
import { dashboardMock } from '../mocks/dashboardMock';
import type {
  CalendarEvent,
  DashboardData,
  PaymentDue,
  RevenueActivity,
  SubscriptionRenewal,
  TenantCompany,
  TenantStatus,
} from '../types/dashboard';

const DAY_MS = 86_400_000;
const WEEKDAY_LABELS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'] as const;

const statusLabels: Record<PlatformStore['status'], TenantStatus> = {
  TRIALING: 'Sinov muddatida',
  ACTIVE: 'Faol',
  PAST_DUE: 'Qarzdor',
  SUSPENDED: 'Bloklangan',
  CANCELLED: 'Bloklangan',
};

const compact = <T>(value: T | null): value is T => value !== null;

const branchLabel = (count: number) => (count === 1 ? '1 ta filial' : `${count} ta filial`);

const paymentAmountUzs = (payment: PlatformPayment) => (payment.currency === 'UZS' ? payment.amount : 0);

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

const getPaymentDate = (payment: PlatformPayment) => payment.approvedAt ?? payment.paidAt ?? payment.createdAt;

const isSameMonth = (value: string, reference: Date) => {
  const date = new Date(value);
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
};

const isPreviousMonth = (value: string, reference: Date) => {
  const date = new Date(value);
  const previousMonth = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  return date.getFullYear() === previousMonth.getFullYear() && date.getMonth() === previousMonth.getMonth();
};

const calculateMonthlyChange = (currentAmount: number, previousAmount: number) => {
  if (!previousAmount) return currentAmount ? 100 : 0;
  return Number((((currentAmount - previousAmount) / previousAmount) * 100).toFixed(1));
};

const remainingLabel = (value: string) => {
  const dueDate = new Date(value);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) return `${Math.abs(diffDays)} kun o‘tdi`;
  if (diffDays === 0) return 'Bugun';
  return `${diffDays} kun qoldi`;
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:00`;
};

const mapTenantCompanies = (stores: PlatformStore[]): TenantCompany[] =>
  stores.slice(0, 5).map((store) => ({
    id: store.id,
    name: store.name,
    plan: store.plan?.name ?? 'Tarif belgilanmagan',
    stores: branchLabel(store._count.branches),
    status: statusLabels[store.status] ?? 'Bloklangan',
  }));

const buildUpcomingPayments = (stores: PlatformStore[]): PaymentDue[] =>
  stores
    .map((store) => {
      const nextPaymentDueAt = store.subscription?.nextPaymentDueAt;
      if (!nextPaymentDueAt) return null;

      return {
        id: `due-${store.id}`,
        company: store.name,
        date: nextPaymentDueAt,
        remaining: remainingLabel(nextPaymentDueAt),
        amount: store.plan?.monthlyPriceUzs ?? 0,
      };
    })
    .filter(compact)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

const buildRenewals = (stores: PlatformStore[]): SubscriptionRenewal[] =>
  stores
    .map((store) => {
      const nextPaymentDueAt = store.subscription?.nextPaymentDueAt;
      if (!nextPaymentDueAt) return null;

      return {
        id: `renewal-${store.id}`,
        time: timeLabel(nextPaymentDueAt),
        company: store.name,
        plan: store.plan?.name ?? 'Tarif belgilanmagan',
        responsibleAdmin: store.ownerName,
        type: store.status === 'TRIALING' ? 'Sinov muddati tugashi' : 'Obuna yangilanishi',
      };
    })
    .filter(compact)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 4);

const buildTodayEvents = (pendingPayments: PlatformPayment[]): CalendarEvent[] => {
  const today = new Date();

  return pendingPayments
    .filter((payment) => {
      const paymentDate = new Date(payment.paidAt ?? payment.createdAt);
      return dateKey(paymentDate) === dateKey(today);
    })
    .slice(0, 3)
    .map((payment) => ({
      id: `event-${payment.id}`,
      title: 'Manual to‘lov tasdiqlash',
      type: 'To‘lov',
      company: payment.store.name,
      time: timeLabel(payment.paidAt ?? payment.createdAt),
      day: today.getDate(),
    }));
};

const buildRevenueActivity = (approvedPayments: PlatformPayment[]): RevenueActivity[] => {
  const today = new Date();
  const amountByDay = new Map<string, number>();

  approvedPayments.forEach((payment) => {
    const key = dateKey(new Date(getPaymentDate(payment)));
    amountByDay.set(key, (amountByDay.get(key) ?? 0) + paymentAmountUzs(payment));
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const amount = (amountByDay.get(dateKey(date)) ?? 0) / 1_000_000;

    return {
      day: WEEKDAY_LABELS[date.getDay()] ?? 'Du',
      amount: Number(amount.toFixed(1)),
    };
  });
};

const mapDashboardData = (
  dashboard: PlatformDashboardResponse,
  stores: PlatformStoresResponse,
  pendingPayments: PlatformPayment[],
  approvedPayments: PlatformPayment[],
): DashboardData => {
  const now = new Date();
  const monthlyRevenue = approvedPayments
    .filter((payment) => isSameMonth(getPaymentDate(payment), now))
    .reduce((sum, payment) => sum + paymentAmountUzs(payment), 0);
  const previousMonthlyRevenue = approvedPayments
    .filter((payment) => isPreviousMonth(getPaymentDate(payment), now))
    .reduce((sum, payment) => sum + paymentAmountUzs(payment), 0);
  const totalStores = stores.total;
  const activeStores = dashboard.activeStores;
  const tenantProgress = totalStores ? (activeStores / totalStores) * 100 : 0;
  const platformHealth = clampPercent(100 - dashboard.overdueStores * 8 - dashboard.pendingPayments * 2);
  const upcomingPayments = buildUpcomingPayments(stores.items);
  const renewals = buildRenewals(stores.items);
  const revenueActivity = buildRevenueActivity(approvedPayments);

  return {
    ...dashboardMock,
    admin: {
      ...dashboardMock.admin,
      managedTenants: totalStores,
      lastLogin: now.toISOString(),
    },
    revenue: {
      amount: monthlyRevenue,
      currency: 'UZS',
      monthlyChange: calculateMonthlyChange(monthlyRevenue, previousMonthlyRevenue),
      progress: clampPercent(previousMonthlyRevenue ? (monthlyRevenue / previousMonthlyRevenue) * 100 : monthlyRevenue ? 100 : 0),
    },
    tenants: {
      active: activeStores,
      weeklyChange: 0,
      totalStores,
      progress: clampPercent(tenantProgress),
      companies: mapTenantCompanies(stores.items),
    },
    payments: {
      dueSoon: dashboard.renewalsDueSoon,
      overdue: dashboard.overdueStores,
      upcoming: upcomingPayments,
    },
    support: {
      newRequests: 0,
      requests: [],
    },
    platform: {
      health: platformHealth,
      statusIndicators: [1, 1, platformHealth / 100, totalStores ? tenantProgress / 100 : 1, dashboard.pendingPayments ? 0.72 : 1],
    },
    selectedCalendarDay: now.getDate(),
    renewals,
    revenueActivity,
    todayEvents: buildTodayEvents(pendingPayments),
    announcements: [
      {
        id: 'announcement-platform-api',
        title: 'Platform admin dashboard backend API bilan ishlayapti.',
        date: now.toISOString(),
        category: 'Tizim',
      },
      {
        id: 'announcement-manual-payments',
        title: 'Manual to‘lov tasdiqlash oqimi tayyor.',
        date: now.toISOString(),
        category: 'Admin',
      },
    ],
  };
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const [dashboard, stores, pendingPayments, approvedPayments] = await Promise.all([
    PlatformSeekApi.dashboard(),
    PlatformSeekApi.listStores({ page: 1, pageSize: 20 }),
    PlatformSeekApi.listPayments('PENDING'),
    PlatformSeekApi.listPayments('APPROVED'),
  ]);

  return mapDashboardData(dashboard, stores, pendingPayments, approvedPayments);
};
