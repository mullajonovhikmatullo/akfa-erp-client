import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty, Skeleton } from 'antd';
import {
  CreditCardOutlined,
  DollarOutlined,
  DropboxOutlined,
  FileTextOutlined,
  InboxOutlined,
  LineChartOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  TeamOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import {
  useCustomerDebt,
  useDashboard,
  useExpenseReport,
  useInventoryReport,
  useSalesReport,
  type AnalyticsQuery,
} from '@/entities/analytics';
import { useCurrentUser } from '@/entities/user';
import { useSel } from '@/app/store.jsx';
import { ROUTES } from '@/shared/config/routes';
import { formatCompactUZS, formatDate } from '@/shared/lib/formatters';
import { useT } from '@/shared/lib/i18n';
import type { PaymentMethod } from '@/shared/types/domain';
import { MoneyDisplay, StatusBadge } from '@/shared/ui';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';
type PaymentChartDatum = {
  name: string;
  value: number;
  count: number;
  color: string;
  percent: number;
};

const COLORS = {
  primary: '#1e4dd8',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  muted: '#64748b',
  cyan: '#0891b2',
  violet: '#7c3aed',
};

const CHART_COLORS = ['#6f8ff2', '#68bd83', '#e0aa55', '#e47f7f', '#61afbf', '#9a83de'];
const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER', 'MIXED', 'CREDIT'];
const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length] ?? COLORS.primary;

export function DashboardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user, isSuper, branchId } = useCurrentUser();
  const lowStockThreshold = useSel((s: { settings: { lowStockThreshold: number } }) => s.settings.lowStockThreshold);
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const branchParam = !isSuper && branchId ? { branchId } : {};

  const now = dayjs();
  const todayQuery: AnalyticsQuery = {
    ...branchParam,
    lowStockThreshold,
    from: now.startOf('day').toISOString(),
    to: now.endOf('day').toISOString(),
    period: 'day',
    limit: 5,
  };
  const monthQuery: AnalyticsQuery = {
    ...branchParam,
    lowStockThreshold,
    from: now.startOf('month').toISOString(),
    to: now.endOf('day').toISOString(),
    period: 'day',
    limit: 5,
  };
  const trendQuery: AnalyticsQuery = {
    ...branchParam,
    lowStockThreshold,
    from: now.subtract(13, 'day').startOf('day').toISOString(),
    to: now.endOf('day').toISOString(),
    period: 'day',
    limit: 6,
  };

  const today = useDashboard(todayQuery);
  const month = useDashboard(monthQuery);
  const sales = useSalesReport(trendQuery);
  const expenses = useExpenseReport(trendQuery);
  const inventory = useInventoryReport(trendQuery);
  const debt = useCustomerDebt({ ...branchParam, limit: 5 });

  const isLoading = today.isLoading || month.isLoading || sales.isLoading || expenses.isLoading || inventory.isLoading || debt.isLoading;
  const isFetching = today.isFetching || month.isFetching || sales.isFetching || expenses.isFetching || inventory.isFetching || debt.isFetching;

  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = now.subtract(13 - index, 'day');
      return {
        iso: date.format('YYYY-MM-DD'),
        label: date.format('DD MMM'),
        revenue: 0,
        paid: 0,
        debt: 0,
        expenses: 0,
      };
    });
    const byIso = new Map(days.map((day) => [day.iso, day]));

    sales.data?.byPeriod.forEach((row) => {
      const key = dayjs(row.period).format('YYYY-MM-DD');
      const target = byIso.get(key);
      if (!target) return;
      target.revenue = row.totalRevenue;
      target.paid = row.paidAmount;
      target.debt = Math.max(0, row.totalRevenue - row.paidAmount);
    });

    expenses.data?.byPeriod.forEach((row) => {
      const key = dayjs(row.period).format('YYYY-MM-DD');
      const target = byIso.get(key);
      if (target) target.expenses = row.amount;
    });

    return days;
  }, [expenses.data, now, sales.data]);

  const paymentRowsByMethod = new Map((sales.data?.byPaymentMethod ?? []).map((row) => [row.paymentMethod, row]));
  const paymentData = PAYMENT_METHODS.map((method) => {
    const row = paymentRowsByMethod.get(method);
    return {
      name: t(`payment.${method}`),
      value: row?.amount ?? 0,
      count: row?.count ?? 0,
    };
  });
  const paymentTotal = paymentData.reduce((sum, item) => sum + item.value, 0);
  const paymentChartData = paymentData
    .map((item, index) => ({
      ...item,
      order: index,
      color: getChartColor(index),
      percent: paymentTotal > 0 ? Math.round((item.value / paymentTotal) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value || a.order - b.order);

  const topProducts = (sales.data?.topProducts ?? []).slice(0, 5);
  const topProductsChartData = topProducts.map((product, index) => ({
    name: product.name,
    revenue: product.totalRevenue,
    color: getChartColor(index),
  }));
  const lowStock = (inventory.data?.lowStock ?? []).slice(0, 5);
  const topDebtors = debt.data?.topDebtors ?? [];
  const monthRevenue = month.data?.sales.totalRevenue ?? 0;
  const monthPaid = month.data?.sales.paidAmount ?? 0;
  const paidRate = monthRevenue > 0 ? Math.round((monthPaid / monthRevenue) * 100) : 0;

  const refetchAll = () => {
    today.refetch();
    month.refetch();
    sales.refetch();
    expenses.refetch();
    inventory.refetch();
    debt.refetch();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <div className="sub">
            {t('dashboard.welcome')}, {firstName} · {formatDate(now.format('YYYY-MM-DD'))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button icon={<PlusOutlined />} onClick={() => navigate(ROUTES.SALES)}>
            {t('dashboard.newSale')}
          </Button>
          <Button icon={<DropboxOutlined />} onClick={() => navigate(ROUTES.PURCHASES)}>
            {t('dashboard.stockIn')}
          </Button>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={refetchAll}>
            {t('common.refresh')}
          </Button>
          <Button type="primary" icon={<LineChartOutlined />} onClick={() => navigate(ROUTES.ANALYTICS)}>
            {t('dashboard.openAnalytics')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <MetricCard
              icon={<ShoppingCartOutlined />}
              label={t('dashboard.todaySales')}
              value={<MoneyDisplay amount={today.data?.sales.totalRevenue ?? 0} currency="UZS" compact />}
              sub={`${today.data?.sales.saleCount ?? 0} ${t('dashboard.kpiTodaySalesSuffix')}`}
              tone="primary"
            />
            <MetricCard
              icon={<CreditCardOutlined />}
              label={t('dashboard.todayPaid')}
              value={<MoneyDisplay amount={today.data?.sales.paidAmount ?? 0} currency="UZS" compact />}
              sub={t('dashboard.paidCashflow')}
              tone="success"
            />
            <MetricCard
              icon={<FileTextOutlined />}
              label={t('dashboard.todayDebt')}
              value={<MoneyDisplay amount={today.data?.sales.outstandingDebt ?? 0} currency="UZS" compact />}
              sub={t('dashboard.unpaidSales')}
              tone="danger"
            />
            <MetricCard
              icon={<WalletOutlined />}
              label={t('dashboard.todayExpenses')}
              value={<MoneyDisplay amount={today.data?.expenses.total ?? 0} currency="UZS" compact />}
              sub={t('dashboard.cashOut')}
              tone="warning"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.salesTrendTitle')}</h3>
                <span className="meta">{t('dashboard.last14Days')}</span>
              </div>
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.24} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.16} />
                      <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,.06)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickFormatter={(v) => formatCompactUZS(Number(v)).replace(" so'm", '')} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={52} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e6e9ef', fontSize: 12 }} formatter={(v) => formatCompactUZS(Number(v))} />
                  <Area type="monotone" dataKey="revenue" name={t('dashboard.chartRevenue')} stroke={COLORS.primary} strokeWidth={2} fill="url(#dashRevenue)" />
                  <Area type="monotone" dataKey="debt" name={t('dashboard.chartDebt')} stroke={COLORS.danger} strokeWidth={2} fill="url(#dashDebt)" />
                  <Area type="monotone" dataKey="expenses" name={t('dashboard.chartExpenses')} stroke={COLORS.warning} strokeWidth={2} fill="url(#dashExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.paymentMix')}</h3>
                <span className="meta">{t('dashboard.last14Days')}</span>
              </div>
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <PaymentDonutChart data={paymentChartData} total={paymentTotal} totalLabel={t('common.total')} />
                <div style={{ flex: '1 1 180px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {paymentChartData.map((item) => (
                    <LegendRow
                      key={item.name}
                      color={item.color}
                      label={item.name}
                      percent={item.percent}
                      value={<MoneyDisplay amount={item.value} currency="UZS" compact />}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <SmallStat label={t('dashboard.monthRevenue')} value={<MoneyDisplay amount={monthRevenue} currency="UZS" compact />} tone="primary" />
            <SmallStat label={t('dashboard.monthPaidRate')} value={`${paidRate}%`} tone={paidRate >= 80 ? 'success' : 'warning'} />
            <SmallStat label={t('dashboard.totalDebt')} value={<MoneyDisplay amount={debt.data?.summary.totalDebt ?? 0} currency="UZS" compact />} tone="danger" />
            <SmallStat label={t('dashboard.stockValue')} value={<MoneyDisplay amount={month.data?.inventory.stockValueUzs ?? 0} currency="UZS" compact />} tone="muted" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.topProducts')}</h3>
                <span className="meta">{t('dashboard.last14Days')}</span>
              </div>
              {topProducts.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topProductsChartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(15,23,42,.06)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} height={54} tickFormatter={(v) => String(v).slice(0, 14)} />
                    <YAxis tickFormatter={(v) => formatCompactUZS(Number(v)).replace(" so'm", '')} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={52} />
                    <Tooltip formatter={(v) => formatCompactUZS(Number(v))} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {topProductsChartData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <ListPanel
              title={t('dashboard.lowStockTitle')}
              action={t('dashboard.manage')}
              onAction={() => navigate(ROUTES.PRODUCTS)}
              empty={lowStock.length === 0}
              emptyText={t('dashboard.stockOkTitle')}
            >
              {lowStock.map((item) => (
                <ListRow
                  key={`${item.branchId}-${item.productId}`}
                  title={item.name}
                  meta={`${item.branchName} · ${t('dashboard.thresholdLabel')}: ${item.threshold}`}
                  right={<StatusBadge tone="warning">{item.currentStock.toLocaleString('ru-RU')} {t(`units.${item.unit}`)}</StatusBadge>}
                  icon={<WarningOutlined style={{ color: COLORS.warning }} />}
                />
              ))}
            </ListPanel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <ListPanel
              title={t('dashboard.topDebtors')}
              action={t('dashboard.allDebtors')}
              onAction={() => navigate(`${ROUTES.CUSTOMERS}?balance=debt`)}
              empty={topDebtors.length === 0}
              emptyText={t('dashboard.noDebtors')}
            >
              {topDebtors.map((customer) => (
                <ListRow
                  key={customer.id}
                  title={customer.fullName}
                  meta={customer.branch.name}
                  right={<MoneyDisplay amount={customer.balance} currency="UZS" compact />}
                  icon={<TeamOutlined style={{ color: COLORS.danger }} />}
                />
              ))}
            </ListPanel>

            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.operationalSnapshot')}</h3>
                <span className="meta">{t('dashboard.currentData')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SnapshotTile icon={<InboxOutlined />} label={t('dashboard.lowStockShort')} value={month.data?.inventory.lowStockCount ?? 0} tone={(month.data?.inventory.lowStockCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<SwapOutlined />} label={t('dashboard.pendingTransfers')} value={month.data?.transfers.pendingCount ?? 0} tone={(month.data?.transfers.pendingCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<DollarOutlined />} label={t('dashboard.netProfit')} value={<MoneyDisplay amount={month.data?.profit.netProfit ?? 0} currency="UZS" compact />} tone={(month.data?.profit.netProfit ?? 0) >= 0 ? 'success' : 'danger'} />
                <SnapshotTile icon={<FileTextOutlined />} label={t('dashboard.debtorCount')} value={debt.data?.summary.debtorCount ?? 0} tone={(debt.data?.summary.debtorCount ?? 0) > 0 ? 'danger' : 'success'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="kpi" style={{ minHeight: 126 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <Skeleton.Input active size="small" style={{ width: 110 }} />
              <Skeleton.Avatar active size={24} shape="square" />
            </div>
            <div style={{ marginTop: 18 }}>
              <Skeleton.Input active size="default" style={{ width: 150 }} />
            </div>
            <div style={{ marginTop: 10 }}>
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            </div>
            <div className="accent" />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <SkeletonPanel height={310} rows={3} />
        <SkeletonPanel height={220} rows={5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card" style={{ padding: '14px 16px' }}>
            <Skeleton.Input active size="small" style={{ width: 120 }} />
            <div style={{ marginTop: 10 }}>
              <Skeleton.Input active size="default" style={{ width: 145 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <SkeletonPanel height={260} rows={2} />
        <SkeletonPanel height={260} rows={5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <SkeletonPanel height={220} rows={4} />
        <SkeletonPanel height={220} rows={4} />
      </div>
    </div>
  );
}

function SkeletonPanel({ height, rows }: { height: number; rows: number }) {
  return (
    <div className="card">
      <div className="card-head">
        <Skeleton.Input active size="small" style={{ width: 150 }} />
        <Skeleton.Input active size="small" style={{ width: 90 }} />
      </div>
      <div style={{ minHeight: height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size={index === 0 ? 'default' : 'small'}
            style={{ width: `${Math.max(46, 86 - index * 9)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, tone }: { icon: ReactNode; label: string; value: ReactNode; sub: string; tone: Tone }) {
  return (
    <div className="kpi" style={{ minHeight: 126 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div className="label">{label}</div>
        <span style={{ color: COLORS[tone], fontSize: 20 }}>{icon}</span>
      </div>
      <div className="value">{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>
      <div className="accent" />
    </div>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: ReactNode; tone: Tone }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 20, fontWeight: 800, color: COLORS[tone] }}>{value}</div>
    </div>
  );
}

function PaymentDonutChart({ data, total, totalLabel }: { data: PaymentChartDatum[]; total: number; totalLabel: string }) {
  const center = 120;
  const radius = 82;
  const strokeWidth = 26;
  const hasSingleSegment = data.length === 1;
  let cursor = 0;
  const segments = data.map((item) => {
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const gap = hasSingleSegment ? 0 : Math.min(4, angle * 0.28);
    const startAngle = cursor + gap / 2;
    const endAngle = cursor + angle - gap / 2;
    cursor += angle;
    return { ...item, startAngle, endAngle };
  });

  return (
    <div style={{ position: 'relative', flex: '0 0 232px', width: 232, maxWidth: '100%', aspectRatio: '1 / 1' }}>
      <svg viewBox="0 0 240 240" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#edf1f7" strokeWidth={strokeWidth} />
        {hasSingleSegment ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={data[0]?.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 8px 14px rgba(15, 23, 42, .10))' }}
          />
        ) : (
          segments.map((segment) => {
            if (segment.endAngle - segment.startAngle <= 0.5) return null;
            return (
              <path
                key={segment.name}
                d={describeArc(center, center, radius, segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 8px 14px rgba(15, 23, 42, .10))' }}
              />
            );
          })
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 62,
          borderRadius: 999,
          background: 'rgba(255,255,255,.94)',
          boxShadow: 'inset 0 0 0 1px rgba(226,232,240,.9), 0 10px 24px rgba(15,23,42,.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{totalLabel}</div>
          <div className="num" style={{ fontSize: 17, fontWeight: 800 }}>
            <MoneyDisplay amount={total} currency="UZS" compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const angleRad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function LegendRow({ color, label, percent, value }: { color: string; label: string; percent: number; value: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '9px 10px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)',
        fontSize: 12,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 0 4px ${color}22`, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
        <span className="num" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{percent}%</span>
        <span className="num" style={{ fontWeight: 700 }}>{value}</span>
      </span>
    </div>
  );
}

function ListPanel({ title, action, onAction, empty, emptyText, children }: { title: string; action?: string; onAction?: () => void; empty: boolean; emptyText: string; children: ReactNode }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {action && (
          <button
            onClick={onAction}
            style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {action}
          </button>
        )}
      </div>
      {empty ? (
        <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--ink-3)', border: '1px dashed var(--border)', borderRadius: 8 }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
      )}
    </div>
  );
}

function ListRow({ icon, title, meta, right }: { icon: ReactNode; title: string; meta: string; right: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center', padding: '9px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</div>
      </div>
      <div className="num" style={{ fontWeight: 700 }}>{right}</div>
    </div>
  );
}

function SnapshotTile({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: Tone }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '34px 1fr auto',
        alignItems: 'center',
        gap: 10,
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)',
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: `${COLORS[tone]}12`,
          color: COLORS[tone],
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0, color: 'var(--ink-2)', fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 800, color: COLORS[tone], textAlign: 'right' }}>{value}</div>
    </div>
  );
}
