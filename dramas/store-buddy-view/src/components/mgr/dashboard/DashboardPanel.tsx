import { useMemo, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, DatePicker, Empty, Skeleton } from 'antd';
import {
  ArrowClockwiseIcon,
  ArrowsLeftRightIcon,
  BoxArrowDownIcon,
  ChartLineUpIcon,
  CreditCardIcon,
  MoneyIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  WalletIcon,
  WarningIcon,
} from '@phosphor-icons/react';
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
import type { PaymentMethod } from '@erp/erp-shared/core';
import { formatCompactUZS, formatDate } from '@erp/erp-shared/lib/formatters';
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display';
import { StatusBadge } from '@erp/erp-shared/ui/status-badge';
import type { AnalyticsQuery } from '@erp/store-buddy-stub';
import {
  useCustomerDebt,
  useDashboard,
  useExpenseReport,
  useInventoryReport,
  useSalesReport,
} from '../analytics/hooks/useAnalyticsReports';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';
type PaymentChartDatum = {
  name: string;
  value: number;
  count: number;
  color: string;
  percent: number;
};
type TrendDatum = {
  iso: string;
  label: string;
  revenue: number;
  paid: number;
  debt: number;
  expenses: number;
};
type TopProductChartDatum = {
  name: string;
  sku: string | null;
  unit: string;
  quantity: number;
  revenue: number;
  color: string;
};

const COLORS = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  muted: 'var(--ink-3)',
  cyan: '#0891b2',
  violet: '#7c3aed',
};

const DASH_PANEL_BG = 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%)';
const DASH_DOT_FILL = 'var(--surface)';
const DASH_GRID = 'var(--grid)';
const DASH_TICK = 'var(--ink-3)';
const DASH_TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink-2)',
  fontSize: 12,
};

const CHART_COLORS = ['#6f8ff2', '#68bd83', '#e0aa55', '#e47f7f', '#61afbf', '#9a83de'];
const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER', 'MIXED', 'CREDIT'];
const TOP_PRODUCTS_LIMIT = 10;
const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length] ?? COLORS.primary;
const getColorHalo = (color: string) =>
  color.startsWith('var(')
    ? `color-mix(in srgb, ${color} 18%, transparent)`
    : `${color}22`;
const getTodayRange = (): [dayjs.Dayjs, dayjs.Dayjs] => [dayjs().startOf('day'), dayjs().endOf('day')];
type DashboardFiltersForm = {
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
};

type TFunc = (key: string) => string;

export interface DashboardPanelProps {
  t: TFunc;
  firstName: string;
  branchId?: string | null;
  lowStockThreshold: number;
  onNewSale: () => void;
  onStockIn: () => void;
  onOpenAnalytics: () => void;
  onManageProducts: () => void;
  onOpenDebtors: () => void;
}

export function DashboardPanel({
  t,
  firstName,
  branchId,
  lowStockThreshold,
  onNewSale,
  onStockIn,
  onOpenAnalytics,
  onManageProducts,
  onOpenDebtors,
}: DashboardPanelProps) {
  //
  const branchParam = branchId ? { branchId } : {};

  const now = dayjs();
  const { control, watch } = useForm<DashboardFiltersForm>({
    defaultValues: { dateRange: getTodayRange() },
  });
  const { dateRange } = watch();
  const rangeStart = dateRange[0]?.startOf('day') ?? now.startOf('day');
  const rangeEnd = dateRange[1]?.endOf('day') ?? now.endOf('day');
  const rangeDays = Math.max(1, rangeEnd.diff(rangeStart, 'day') + 1);
  const chartPeriod: AnalyticsQuery['period'] = rangeDays > 180 ? 'month' : rangeDays > 45 ? 'week' : 'day';
  const periodMeta = `${formatDate(rangeStart.format('YYYY-MM-DD'))} - ${formatDate(rangeEnd.format('YYYY-MM-DD'))}`;
  const isTodayRange = rangeStart.isSame(now, 'day') && rangeEnd.isSame(now, 'day');

  const periodQuery: AnalyticsQuery = {
    ...branchParam,
    lowStockThreshold,
    from: rangeStart.toISOString(),
    to: rangeEnd.toISOString(),
    period: chartPeriod,
    limit: TOP_PRODUCTS_LIMIT,
  };
  const inventoryQuery: AnalyticsQuery = { ...branchParam, lowStockThreshold, limit: 5 };

  const periodDashboard = useDashboard(periodQuery);
  const sales = useSalesReport(periodQuery);
  const expenses = useExpenseReport(periodQuery);
  const inventory = useInventoryReport(inventoryQuery);
  const debt = useCustomerDebt({ ...branchParam, limit: 5 });

  const isLoading = periodDashboard.isLoading || sales.isLoading || expenses.isLoading || inventory.isLoading || debt.isLoading;
  const isFetching = periodDashboard.isFetching || sales.isFetching || expenses.isFetching || inventory.isFetching || debt.isFetching;

  const trendData = useMemo(() => {
    //
    const formatKey = (date: dayjs.Dayjs) => {
      //
      if (chartPeriod === 'month') return date.format('YYYY-MM');
      if (chartPeriod === 'week') return date.startOf('week').format('YYYY-MM-DD');
      return date.format('YYYY-MM-DD');
    };
    const formatLabel = (date: dayjs.Dayjs) => {
      //
      if (chartPeriod === 'month') return date.format('MMM YYYY');
      if (chartPeriod === 'week') return date.format('DD MMM');
      return date.format('DD MMM');
    };
    const buckets: TrendDatum[] = [];
    let cursor =
      chartPeriod === 'month'
        ? rangeStart.startOf('month')
        : chartPeriod === 'week'
          ? rangeStart.startOf('week')
          : rangeStart.startOf('day');
    const endCursor =
      chartPeriod === 'month'
        ? rangeEnd.startOf('month')
        : chartPeriod === 'week'
          ? rangeEnd.startOf('week')
          : rangeEnd.startOf('day');

    while (cursor.isBefore(endCursor) || cursor.isSame(endCursor)) {
      const date = cursor;
      buckets.push({
        iso: formatKey(date),
        label: formatLabel(date),
        revenue: 0,
        paid: 0,
        debt: 0,
        expenses: 0,
      });
      cursor = cursor.add(1, chartPeriod);
    }

    const byIso = new Map(buckets.map((day) => [day.iso, day]));

    sales.data?.byPeriod.forEach((row) => {
      //
      const key = formatKey(dayjs(row.period));
      const target = byIso.get(key);
      if (!target) return;
      target.revenue = row.totalRevenue;
      target.paid = row.paidAmount;
      target.debt = Math.max(0, row.totalRevenue - row.paidAmount);
    });

    expenses.data?.byPeriod.forEach((row) => {
      //
      const key = formatKey(dayjs(row.period));
      const target = byIso.get(key);
      if (target) target.expenses = row.amount;
    });

    return buckets;
  }, [chartPeriod, expenses.data, rangeEnd, rangeStart, sales.data]);

  const paymentRowsByMethod = new Map((sales.data?.byPaymentMethod ?? []).map((row) => [row.paymentMethod, row]));
  const paymentData = PAYMENT_METHODS.map((method) => {
    //
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

  const topProducts = (sales.data?.topProducts ?? []).slice(0, TOP_PRODUCTS_LIMIT);
  const topProductsChartData: TopProductChartDatum[] = topProducts.map((product, index) => ({
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    quantity: product.totalQuantity,
    revenue: product.totalRevenue,
    color: getChartColor(index),
  }));
  const lowStock = (inventory.data?.lowStock ?? []).slice(0, 5);
  const topDebtors = debt.data?.topDebtors ?? [];
  const avgOrderValue = sales.data?.summary.avgOrderValue ?? 0;
  const expenseCount = expenses.data?.summary.count ?? 0;

  const refetchAll = () => {
    //
    periodDashboard.refetch();
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
            {t('dashboard.welcome')}, {firstName}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button icon={<PlusIcon size={18} />} onClick={onNewSale}>
            {t('dashboard.newSale')}
          </Button>
          <Button icon={<BoxArrowDownIcon size={18} />} onClick={onStockIn}>
            {t('dashboard.stockIn')}
          </Button>
          <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={refetchAll}>
            {t('common.refresh')}
          </Button>
          <Button type="primary" icon={<ChartLineUpIcon size={18} weight="bold" />} onClick={onOpenAnalytics}>
            {t('dashboard.openAnalytics')}
          </Button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: '10px 12px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink-2)' }}>{t('dashboard.selectedPeriod')}</span>
            {isTodayRange && <StatusBadge tone="success">{t('common.today')}</StatusBadge>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{periodMeta}</div>
        </div>
        <Controller
          name="dateRange"
          control={control}
          render={({ field }) => (
            <DatePicker.RangePicker
              value={field.value}
              onChange={(value) => field.onChange(value?.[0] && value?.[1] ? [value[0], value[1]] : getTodayRange())}
              format="DD.MM.YYYY"
              placeholder={[t('common.startDate'), t('common.endDate')]}
              presets={[
                { label: t('common.today'), value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs().endOf('day')] },
                { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')] },
                { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day').startOf('day'), dayjs().endOf('day')] },
              ]}
              style={{ minWidth: 260 }}
            />
          )}
        />
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <MetricCard
              icon={<ShoppingCartIcon size={28} weight="duotone" />}
              label={t('dashboard.periodSales')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.totalRevenue ?? 0} currency="UZS" compact />}
              sub={`${periodDashboard.data?.sales.saleCount ?? 0} ${t('dashboard.kpiTodaySalesSuffix')}`}
              tone="primary"
            />
            <MetricCard
              icon={<CreditCardIcon size={28} weight="duotone" />}
              label={t('dashboard.periodPaid')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.paidAmount ?? 0} currency="UZS" compact />}
              sub={t('dashboard.paidCashflow')}
              tone="success"
            />
            <MetricCard
              icon={<ReceiptIcon size={28} weight="duotone" />}
              label={t('dashboard.periodDebt')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.outstandingDebt ?? 0} currency="UZS" compact />}
              sub={t('dashboard.unpaidSales')}
              tone="danger"
            />
            <MetricCard
              icon={<WalletIcon size={28} weight="duotone" />}
              label={t('dashboard.periodExpenses')}
              value={<MoneyDisplay amount={periodDashboard.data?.expenses.total ?? 0} currency="UZS" compact />}
              sub={t('dashboard.cashOut')}
              tone="warning"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.salesTrendTitle')}</h3>
                <span className="meta">{periodMeta}</span>
              </div>
              <SalesTrendChart
                data={trendData}
                revenueLabel={t('dashboard.chartRevenue')}
                debtLabel={t('dashboard.chartDebt')}
                expensesLabel={t('dashboard.chartExpenses')}
              />
            </div>

            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.paymentMix')}</h3>
                <span className="meta">{periodMeta}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                <PaymentDonutChart data={paymentChartData} total={paymentTotal} totalLabel={t('common.total')} />
                <div style={{ flex: '1 1 0', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 7 }}>
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
            <SmallStat label={t('dashboard.avgOrderValue')} value={<MoneyDisplay amount={avgOrderValue} currency="UZS" compact />} tone="muted" />
            <SmallStat label={t('dashboard.periodNetProfit')} value={<MoneyDisplay amount={periodDashboard.data?.profit.netProfit ?? 0} currency="UZS" compact />} tone={(periodDashboard.data?.profit.netProfit ?? 0) >= 0 ? 'success' : 'danger'} />
            <SmallStat label={t('dashboard.expenseCount')} value={expenseCount.toLocaleString('ru-RU')} tone="warning" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.topProducts')}</h3>
                <span className="meta">{periodMeta}</span>
              </div>
              {topProducts.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={topProductsChartData}
                    layout="vertical"
                    margin={{ left: 4, right: 14, top: 8, bottom: 0 }}
                    barCategoryGap={8}
                  >
                    <CartesianGrid stroke={DASH_GRID} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => formatCompactUZS(Number(v)).replace(" so'm", '')} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: DASH_TICK }} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: DASH_TICK }} width={120} interval={0} tickFormatter={(v) => String(v).length > 18 ? `${String(v).slice(0, 18)}...` : String(v)} />
                    <Tooltip
                      content={
                        <TopProductsTooltip
                          revenueLabel={t('common.revenue')}
                          quantityLabel={t('dashboard.soldQuantity')}
                          unitLabel={(unit) => t(`units.${unit}`)}
                        />
                      }
                      cursor={{ fill: 'var(--primary-soft)', fillOpacity: 0.58, radius: 8 }}
                      allowEscapeViewBox={{ x: true, y: true }}
                      offset={12}
                      isAnimationActive={false}
                    />
                    <Bar dataKey="revenue" name={t('common.revenue')} radius={[0, 6, 6, 0]} barSize={16}>
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
              onAction={onManageProducts}
              empty={lowStock.length === 0}
              emptyText={t('dashboard.stockOkTitle')}
            >
              {lowStock.map((item) => (
                <ListRow
                  key={`${item.branchId}-${item.productId}`}
                  title={item.name}
                  meta={`${item.branchName} · ${t('dashboard.thresholdLabel')}: ${item.threshold}`}
                  right={<StatusBadge tone="warning">{item.currentStock.toLocaleString('ru-RU')} {t(`units.${item.unit}`)}</StatusBadge>}
                  icon={<WarningIcon size={18} weight="duotone" color="currentColor" style={{ color: COLORS.warning }} />}
                />
              ))}
            </ListPanel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <ListPanel
              title={t('dashboard.topDebtors')}
              action={t('dashboard.allDebtors')}
              onAction={onOpenDebtors}
              empty={topDebtors.length === 0}
              emptyText={t('dashboard.noDebtors')}
            >
              {topDebtors.map((customer) => (
                <ListRow
                  key={customer.id}
                  title={customer.fullName}
                  meta={customer.branch.name}
                  right={<MoneyDisplay amount={customer.balance} currency="UZS" compact />}
                  icon={<UserCircleIcon size={18} weight="duotone" color="currentColor" style={{ color: COLORS.danger }} />}
                />
              ))}
            </ListPanel>

            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.operationalSnapshot')}</h3>
                <span className="meta">{t('dashboard.currentData')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SnapshotTile icon={<PackageIcon size={18} weight="duotone" />} label={t('dashboard.lowStockShort')} value={periodDashboard.data?.inventory.lowStockCount ?? 0} tone={(periodDashboard.data?.inventory.lowStockCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<ArrowsLeftRightIcon size={18} weight="duotone" />} label={t('dashboard.pendingTransfers')} value={periodDashboard.data?.transfers.pendingCount ?? 0} tone={(periodDashboard.data?.transfers.pendingCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<MoneyIcon size={18} weight="duotone" />} label={t('dashboard.stockValue')} value={<MoneyDisplay amount={periodDashboard.data?.inventory.stockValueUzs ?? 0} currency="UZS" compact />} tone="muted" />
                <SnapshotTile icon={<ReceiptIcon size={18} weight="duotone" />} label={t('dashboard.debtorCount')} value={debt.data?.summary.debtorCount ?? 0} tone={(debt.data?.summary.debtorCount ?? 0) > 0 ? 'danger' : 'success'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TopProductsTooltip({
  active,
  payload,
  revenueLabel,
  quantityLabel,
  unitLabel,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: TopProductChartDatum }>;
  revenueLabel: string;
  quantityLabel: string;
  unitLabel: (unit: string) => string;
}) {
  //
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="dashboard-chart-tooltip">
      <div className="dashboard-chart-tooltip__head">
        <span className="dashboard-chart-tooltip__marker" style={{ background: item.color, color: item.color }} />
        <div className="dashboard-chart-tooltip__title-wrap">
          <div className="dashboard-chart-tooltip__title">{item.name}</div>
          {item.sku && <div className="dashboard-chart-tooltip__meta">SKU: {item.sku}</div>}
        </div>
      </div>
      <div className="dashboard-chart-tooltip__rows">
        <div className="dashboard-chart-tooltip__row">
          <span>{revenueLabel}</span>
          <strong className="num">{formatCompactUZS(item.revenue)}</strong>
        </div>
        <div className="dashboard-chart-tooltip__row">
          <span>{quantityLabel}</span>
          <strong className="num">
            {item.quantity.toLocaleString('ru-RU')} {unitLabel(item.unit)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  //
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
  //
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
  //
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
  //
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 20, fontWeight: 800, color: COLORS[tone] }}>{value}</div>
    </div>
  );
}

function SalesTrendChart({
  data,
  revenueLabel,
  debtLabel,
  expensesLabel,
}: {
  data: TrendDatum[];
  revenueLabel: string;
  debtLabel: string;
  expensesLabel: string;
}) {
  //
  const series: { key: 'revenue' | 'debt' | 'expenses'; label: string; color: string; gradientId: string }[] = [
    { key: 'revenue', label: revenueLabel, color: COLORS.primary, gradientId: 'dashRevenue' },
    { key: 'debt', label: debtLabel, color: COLORS.danger, gradientId: 'dashDebt' },
    { key: 'expenses', label: expensesLabel, color: COLORS.warning, gradientId: 'dashExpenses' },
  ];
  const values = data.flatMap((item) => series.map((itemSeries) => item[itemSeries.key]));
  const maxValue = Math.max(0, ...values);
  const yMax = maxValue > 0 ? maxValue * 1.18 : 1;
  const isSinglePoint = data.length <= 1;
  const chartType = isSinglePoint ? 'linear' : 'monotone';
  const dotProps = isSinglePoint
    ? { r: 5, strokeWidth: 2, fill: DASH_DOT_FILL }
    : data.length <= 7
      ? { r: 2.5, strokeWidth: 1.5, fill: DASH_DOT_FILL }
      : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          minHeight: 254,
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: DASH_PANEL_BG,
          padding: '8px 8px 2px',
        }}
      >
        <ResponsiveContainer width="100%" height={244}>
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
            <CartesianGrid stroke={DASH_GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
              interval={0}
              padding={{ left: isSinglePoint ? 62 : 8, right: isSinglePoint ? 62 : 8 }}
            />
            <YAxis
              domain={[0, yMax]}
              tickFormatter={(v) => formatCompactUZS(Number(v)).replace(" so'm", '')}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: DASH_TICK }}
              width={52}
            />
            <Tooltip
              contentStyle={DASH_TOOLTIP_STYLE}
              labelStyle={{ color: 'var(--ink-2)' }}
              itemStyle={{ color: 'var(--ink-2)' }}
              formatter={(v) => formatCompactUZS(Number(v))}
            />
            {series.map((item) => (
              <Area
                key={item.key}
                type={chartType}
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2.25}
                fill={`url(#${item.gradientId})`}
                dot={dotProps}
                activeDot={{ r: 6, strokeWidth: 2, fill: DASH_DOT_FILL }}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))', gap: 7 }}>
        {series.map((item) => (
          <TrendValueTile
            key={item.key}
            color={item.color}
            label={item.label}
            value={data.reduce((sum, row) => sum + row[item.key], 0)}
          />
        ))}
      </div>
    </div>
  );
}

function TrendValueTile({ color, label, value }: { color: string; label: string; value: number }) {
  //
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '4px 8px',
        padding: '8px 9px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: DASH_PANEL_BG,
        fontSize: 11.5,
        minWidth: 0,
      }}
    >
      <span style={{ width: 9, height: 9, marginTop: 4, borderRadius: 999, background: color, boxShadow: `0 0 0 4px ${getColorHalo(color)}` }} />
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span className="num" style={{ gridColumn: '2', fontWeight: 700 }}>
        <MoneyDisplay amount={value} currency="UZS" compact />
      </span>
    </div>
  );
}

function PaymentDonutChart({ data, total, totalLabel }: { data: PaymentChartDatum[]; total: number; totalLabel: string }) {
  //
  const center = 120;
  const radius = 82;
  const strokeWidth = 26;
  const hasSingleSegment = data.length === 1;
  let cursor = 0;
  const segments = data.map((item) => {
    //
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const gap = hasSingleSegment ? 0 : Math.min(4, angle * 0.28);
    const startAngle = cursor + gap / 2;
    const endAngle = cursor + angle - gap / 2;
    cursor += angle;
    return { ...item, startAngle, endAngle };
  });

  return (
    <div style={{ position: 'relative', flex: '0 0 clamp(250px, 52%, 278px)', width: 278, maxWidth: '100%', aspectRatio: '1 / 1' }}>
      <svg viewBox="0 0 240 240" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
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
            //
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
          background: 'var(--surface)',
          boxShadow: 'inset 0 0 0 1px var(--border), 0 10px 24px rgba(2,6,23,.10)',
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
  //
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  //
  const angleRad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function LegendRow({ color, label, percent, value }: { color: string; label: string; percent: number; value: ReactNode }) {
  //
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '4px 8px',
        padding: '8px 9px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: DASH_PANEL_BG,
        fontSize: 11.5,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 0 4px ${getColorHalo(color)}`, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </span>
      <span className="num" style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{percent}%</span>
      <span className="num" style={{ gridColumn: '1 / -1', fontWeight: 700, paddingLeft: 16 }}>{value}</span>
    </div>
  );
}

function ListPanel({ title, action, onAction, empty, emptyText, children }: { title: string; action?: string; onAction?: () => void; empty: boolean; emptyText: string; children: ReactNode }) {
  //
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
  //
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
  //
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
        background: DASH_PANEL_BG,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: getColorHalo(COLORS[tone]),
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
