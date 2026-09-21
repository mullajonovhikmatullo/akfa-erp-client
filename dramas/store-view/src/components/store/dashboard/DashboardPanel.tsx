import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, DatePicker, Empty } from 'antd';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise';
import { ArrowLineDownIcon } from '@phosphor-icons/react/dist/csr/ArrowLineDown';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight';
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/csr/ChartLineUp';
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins';
import { MoneyIcon } from '@phosphor-icons/react/dist/csr/Money';
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { ReceiptIcon } from '@phosphor-icons/react/dist/csr/Receipt';
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle';
import { UsersThreeIcon } from '@phosphor-icons/react/dist/csr/UsersThree';
import { WalletIcon } from '@phosphor-icons/react/dist/csr/Wallet';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle';

import dayjs from 'dayjs';
import { resolveStoreTranslationKey, useStoreT } from '@store/store-i18n';
import { formatDate } from '@store/store-shared/lib/formatters';
import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { StatusBadge } from '@store/store-shared/ui/status-badge';
import type { AnalyticsQuery } from '@store/store-stub';
import { useCustomerDebtReport } from '../analytics/hooks/useCustomerDebtReport';
import { useDashboardReport } from '../analytics/hooks/useDashboardReport';
import { useExpenseReport } from '../analytics/hooks/useExpenseReport';
import { useInventoryReport } from '../analytics/hooks/useInventoryReport';
import { useSalesReport } from '../analytics/hooks/useSalesReport';
import {
  DashboardSkeleton,
  LegendRow,
  ListPanel,
  ListRow,
  MetricCard,
  PaymentDonutChart,
  SalesTrendChart,
  SmallStat,
  SnapshotTile,
  TOP_PRODUCTS_LIMIT,
  TopProductsCard,
  createPaymentChartData,
  createTrendData,
  getTodayRange,
} from './view';
import type { DashboardFiltersForm } from './view';

export interface DashboardPanelProps {
  firstName: string;
  branchId?: string | null;
  onNewSale: () => void;
  onStockIn: () => void;
  onOpenAnalytics: () => void;
  onManageProducts: () => void;
  onOpenDebtors: () => void;
}

export function DashboardPanel({
  firstName,
  branchId,
  onNewSale,
  onStockIn,
  onOpenAnalytics,
  onManageProducts,
  onOpenDebtors,
}: DashboardPanelProps) {
  //
  const t = useStoreT();
  const branchParam = branchId ? { branchId } : {};

  const now = dayjs();
  const { control, watch } = useForm<DashboardFiltersForm>({
    defaultValues: { dateRange: getTodayRange() },
  });
  const { dateRange } = watch();
  const rangeStart = dateRange[0]?.startOf('day') ?? now.startOf('day');
  const rangeEnd = dateRange[1]?.endOf('day') ?? now.endOf('day');
  const rangeDays = Math.max(1, rangeEnd.diff(rangeStart, 'day') + 1);
  const chartPeriod: AnalyticsQuery['period'] =
    rangeDays === 1 ? 'hour' : rangeDays > 180 ? 'month' : rangeDays > 45 ? 'week' : 'day';
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

  const periodDashboard = useDashboardReport(periodQuery);
  const sales = useSalesReport(salesQuery);
  const expenses = useExpenseReport(periodQuery);
  const inventory = useInventoryReport(inventoryQuery);
  const debt = useCustomerDebtReport({ ...branchParam, limit: 5 });

  const isLoading = periodDashboard.isLoading || sales.isLoading || expenses.isLoading || inventory.isLoading || debt.isLoading;
  const isFetching = periodDashboard.isFetching || sales.isFetching || expenses.isFetching || inventory.isFetching || debt.isFetching;
  const hasAnalyticsError = periodDashboard.isError || sales.isError || expenses.isError || inventory.isError || debt.isError;
  const isDashboardUnavailable = periodDashboard.isError && !periodDashboard.data;

  const trendData = useMemo(
    () => createTrendData({ chartPeriod, rangeStart, rangeEnd, sales: sales.data, expenses: expenses.data }),
    [chartPeriod, expenses.data, rangeEnd, rangeStart, sales.data],
  );
  const { data: paymentChartData, total: paymentTotal } = useMemo(
    () => createPaymentChartData(sales.data?.byPaymentMethod ?? [], t),
    [sales.data?.byPaymentMethod, t],
  );

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
        <div className="u-flex u-flex-wrap u-gap-10">
          <Button type="primary" icon={<PlusIcon size={16} weight="regular" aria-hidden="true" />} onClick={onNewSale}>
            {t('dashboard.newSale')}
          </Button>
          <Button icon={<ArrowLineDownIcon size={16} weight="regular" aria-hidden="true" />} onClick={onStockIn}>
            {t('dashboard.stockIn')}
          </Button>
          <Button icon={<ChartLineUpIcon size={16} weight="regular" aria-hidden="true" />} onClick={onOpenAnalytics}>
            {t('dashboard.openAnalytics')}
          </Button>
          <Button icon={<ArrowClockwiseIcon size={16} weight="regular" className={isFetching ? 'ph-icon-spin' : undefined} aria-hidden="true" />} onClick={refetchAll}>
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      <div
        className="card u-items-center u-flex u-flex-wrap u-gap-12 u-justify-between u-mb-14 u-p-10-12"

      >
        <div>
          <div className="u-items-center u-flex u-flex-wrap u-gap-8">
            <span className="u-text-secondary u-fs-14 u-fw-800">{t('dashboard.selectedPeriod')}</span>
            {isTodayRange && <StatusBadge tone="success">{t('common.today')}</StatusBadge>}
          </div>
          <div className="u-text-muted u-fs-12 u-mt-2">{periodMeta}</div>
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
              className="u-min-w-260"
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
          className="u-mb-14"
        />
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : isDashboardUnavailable ? (
        <div className="card u-items-start u-flex u-flex-col u-gap-12 u-p-18" >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.loadErrorTitle')} />
          <Button type="primary" icon={<ArrowClockwiseIcon size={20} weight="regular" aria-hidden="true" />} onClick={refetchAll}>
            {t('common.refresh')}
          </Button>
        </div>
      ) : (
        <div className="u-flex u-flex-col u-gap-12">
          <div className="u-grid u-gap-12 u-grid-cols-fit-220">
            <MetricCard
              icon={<ChartLineUpIcon size={24} weight="regular" aria-hidden="true" />}
              label={t('dashboard.periodSales')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.totalRevenue ?? 0} currency="UZS" />}
              sub={`${periodDashboard.data?.sales.saleCount ?? 0} ${t('dashboard.kpiTodaySalesSuffix')}`}
              tone="primary"
            />
            <MetricCard
              icon={<MoneyIcon size={24} weight="regular" aria-hidden="true" />}
              label={t('dashboard.periodPaid')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.paidAmount ?? 0} currency="UZS" />}
              sub={t('dashboard.paidCashflow')}
              tone="success"
            />
            <MetricCard
              icon={<ReceiptIcon size={24} weight="regular" aria-hidden="true" />}
              label={t('dashboard.periodDebt')}
              value={<MoneyDisplay amount={periodDashboard.data?.sales.outstandingDebt ?? 0} currency="UZS" />}
              sub={t('dashboard.unpaidSales')}
              tone="danger"
            />
            <MetricCard
              icon={<WalletIcon size={24} weight="regular" aria-hidden="true" />}
              label={t('dashboard.periodExpenses')}
              value={<MoneyDisplay amount={periodDashboard.data?.expenses.total ?? 0} currency="UZS" />}
              sub={t('dashboard.cashOut')}
              tone="warning"
            />
          </div>

          <div className="u-grid u-gap-12 u-grid-cols-fit-280">
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

          <div className="u-grid u-gap-12 u-grid-cols-fit-180">
            <SmallStat label={t('dashboard.avgOrderValue')} value={<MoneyDisplay amount={avgOrderValue} currency="UZS" compact />} tone="muted" />
            <SmallStat label={t('dashboard.periodNetProfit')} value={<MoneyDisplay amount={periodDashboard.data?.profit.netProfit ?? 0} currency="UZS" compact />} tone={(periodDashboard.data?.profit.netProfit ?? 0) >= 0 ? 'success' : 'danger'} />
            <SmallStat label={t('dashboard.expenseCount')} value={expenseCount.toLocaleString('ru-RU')} tone="warning" />
          </div>

          <div className="u-grid u-gap-12 u-grid-cols-fit-280">
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
                  right={<StatusBadge tone="warning">{item.currentStock.toLocaleString('ru-RU')} {t(resolveStoreTranslationKey(`units.${item.unit}`, 'units.unknown'))}</StatusBadge>}
                  icon={<WarningCircleIcon size={20} weight="regular" className="tone-warning" aria-hidden="true" />}
                />
              ))}
            </ListPanel>
          </div>

          <div className="u-grid u-gap-12 u-grid-cols-fit-280">
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
                  icon={<UserCircleIcon size={20} weight="regular" className="tone-danger" aria-hidden="true" />}
                />
              ))}
            </ListPanel>

            <div className="card">
              <div className="card-head">
                <h3>{t('dashboard.operationalSnapshot')}</h3>
                <span className="meta">{t('dashboard.currentData')}</span>
              </div>
              <div className="u-flex u-flex-col u-gap-8">
                <SnapshotTile icon={<PackageIcon size={20} weight="regular" aria-hidden="true" />} label={t('dashboard.lowStockShort')} value={periodDashboard.data?.inventory.lowStockCount ?? 0} tone={(periodDashboard.data?.inventory.lowStockCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<ArrowsLeftRightIcon size={20} weight="regular" aria-hidden="true" />} label={t('dashboard.pendingTransfers')} value={periodDashboard.data?.transfers.pendingCount ?? 0} tone={(periodDashboard.data?.transfers.pendingCount ?? 0) > 0 ? 'warning' : 'success'} />
                <SnapshotTile icon={<CoinsIcon size={20} weight="regular" aria-hidden="true" />} label={t('dashboard.stockValue')} value={<MoneyDisplay amount={periodDashboard.data?.inventory.stockValueUzs ?? 0} currency="UZS" compact />} tone="muted" />
                <SnapshotTile icon={<UsersThreeIcon size={20} weight="regular" aria-hidden="true" />} label={t('dashboard.debtorCount')} value={debt.data?.summary.debtorCount ?? 0} tone={(debt.data?.summary.debtorCount ?? 0) > 0 ? 'danger' : 'success'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
