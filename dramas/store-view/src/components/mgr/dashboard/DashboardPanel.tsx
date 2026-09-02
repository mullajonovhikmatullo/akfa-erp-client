import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, DatePicker, Empty } from 'antd';
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
import dayjs from 'dayjs';
import { formatDate } from '@store/store-shared/lib/formatters';
import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { StatusBadge } from '@store/store-shared/ui/status-badge';
import type { AnalyticsQuery } from '@store/store-stub';
import {
  useCustomerDebt,
  useDashboard,
  useExpenseReport,
  useInventoryReport,
  useSalesReport,
} from '../analytics/hooks/useAnalyticsReports';
import {
  COLORS,
  DashboardSkeleton,
  LegendRow,
  ListPanel,
  ListRow,
  MetricCard,
  PAYMENT_METHODS,
  PaymentDonutChart,
  SalesTrendChart,
  SmallStat,
  SnapshotTile,
  TOP_PRODUCTS_LIMIT,
  TopProductsCard,
  getChartColor,
  getTodayRange,
} from './view';
import type { DashboardFiltersForm, TFunc, TrendDatum } from './view';

export interface DashboardPanelProps {
  t: TFunc;
  firstName: string;
  branchId?: string | null;
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
    from: rangeStart.toISOString(),
    to: rangeEnd.toISOString(),
    period: chartPeriod,
    limit: TOP_PRODUCTS_LIMIT,
  };
  const inventoryQuery: AnalyticsQuery = { ...branchParam, limit: 5 };
  const salesQuery: AnalyticsQuery = { ...periodQuery, topProductsSort: 'revenue' };

  const periodDashboard = useDashboard(periodQuery);
  const sales = useSalesReport(salesQuery);
  const expenses = useExpenseReport(periodQuery);
  const inventory = useInventoryReport(inventoryQuery);
  const debt = useCustomerDebt({ ...branchParam, limit: 5 });

  const isLoading = periodDashboard.isLoading || sales.isLoading || expenses.isLoading || inventory.isLoading || debt.isLoading;
  const isFetching = periodDashboard.isFetching || sales.isFetching || expenses.isFetching || inventory.isFetching || debt.isFetching;
  const hasAnalyticsError = periodDashboard.isError || sales.isError || expenses.isError || inventory.isError || debt.isError;
  const isDashboardUnavailable = periodDashboard.isError && !periodDashboard.data;

  const trendData = useMemo(() => {
    const formatKey = (date: dayjs.Dayjs) => {
      if (chartPeriod === 'month') return date.format('YYYY-MM');
      if (chartPeriod === 'week') return date.startOf('week').format('YYYY-MM-DD');
      return date.format('YYYY-MM-DD');
    };
    const formatLabel = (date: dayjs.Dayjs) => {
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
      const key = formatKey(dayjs(row.period));
      const target = byIso.get(key);
      if (!target) return;
      target.revenue = row.totalRevenue;
      target.paid = row.paidAmount;
      target.debt = Math.max(0, row.totalRevenue - row.paidAmount);
    });

    expenses.data?.byPeriod.forEach((row) => {
      const key = formatKey(dayjs(row.period));
      const target = byIso.get(key);
      if (target) target.expenses = row.amount;
    });

    return buckets;
  }, [chartPeriod, expenses.data, rangeEnd, rangeStart, sales.data]);

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

  const lowStock = (inventory.data?.lowStock ?? []).slice(0, 5);
  const topDebtors = debt.data?.topDebtors ?? [];
  const avgOrderValue = sales.data?.summary.avgOrderValue ?? 0;
  const expenseCount = expenses.data?.summary.count ?? 0;

  const refetchAll = () => {
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
          <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={onNewSale}>
            {t('dashboard.newSale')}
          </Button>
          <Button icon={<BoxArrowDownIcon size={13} />} onClick={onStockIn}>
            {t('dashboard.stockIn')}
          </Button>
          <Button icon={<ChartLineUpIcon size={13} />} onClick={onOpenAnalytics}>
            {t('dashboard.openAnalytics')}
          </Button>
          <Button icon={<ArrowClockwiseIcon size={13} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={refetchAll}>
            {t('common.refresh')}
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

      {hasAnalyticsError && (
        <Alert
          type="error"
          showIcon
          message={t('dashboard.loadErrorTitle')}
          description={t('dashboard.loadErrorDescription')}
          action={
            <Button size="small" onClick={refetchAll}>
              {t('common.refresh')}
            </Button>
          }
          style={{ marginBottom: 14 }}
        />
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : isDashboardUnavailable ? (
        <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.loadErrorTitle')} />
          <Button type="primary" icon={<ArrowClockwiseIcon size={18} />} onClick={refetchAll}>
            {t('common.refresh')}
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <MetricCard
              icon={<ShoppingCartIcon size={28} weight="duotone" />}
              label={t('dashboard.periodSales')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.totalRevenue ?? 0} currency="UZS" />}
              sub={`${periodDashboard.data?.sales.saleCount ?? 0} ${t('dashboard.kpiTodaySalesSuffix')}`}
              tone="primary"
            />
            <MetricCard
              icon={<CreditCardIcon size={28} weight="duotone" />}
              label={t('dashboard.periodPaid')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.paidAmount ?? 0} currency="UZS" />}
              sub={t('dashboard.paidCashflow')}
              tone="success"
            />
            <MetricCard
              icon={<ReceiptIcon size={28} weight="duotone" />}
              label={t('dashboard.periodDebt')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.outstandingDebt ?? 0} currency="UZS" />}
              sub={t('dashboard.unpaidSales')}
              tone="danger"
            />
            <MetricCard
              icon={<WalletIcon size={28} weight="duotone" />}
              label={t('dashboard.periodExpenses')}
              value={<MoneyDisplay amount={periodDashboard.data?.expenses.total ?? 0} currency="UZS" />}
              sub={t('dashboard.cashOut')}
              tone="warning"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
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

            <div className="card dashboard-payment-card">
              <div className="card-head">
                <h3>{t('dashboard.paymentMix')}</h3>
                <span className="meta">{periodMeta}</span>
              </div>
              <div className="dashboard-payment-card__content">
                <PaymentDonutChart data={paymentChartData} total={paymentTotal} totalLabel={t('common.total')} />
                <div className="dashboard-payment-card__legend">
                  {paymentChartData.map((item) => (
                    <LegendRow
                      key={item.name}
                      color={item.color}
                      label={item.name}
                      percent={item.percent}
                      value={<MoneyDisplay amount={item.value} currency="UZS" />}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <SmallStat label={t('dashboard.avgOrderValue')} value={<MoneyDisplay amount={avgOrderValue} currency="UZS" compact />} tone="muted" />
            <SmallStat label={t('dashboard.periodNetProfit')} value={<MoneyDisplay amount={periodDashboard.data?.profit.netProfit ?? 0} currency="UZS" compact />} tone={(periodDashboard.data?.profit.netProfit ?? 0) >= 0 ? 'success' : 'danger'} />
            <SmallStat label={t('dashboard.expenseCount')} value={expenseCount.toLocaleString('ru-RU')} tone="warning" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <TopProductsCard t={t} query={periodQuery} periodMeta={periodMeta} />

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
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
