import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, DatePicker, Select, Skeleton, Table, Alert } from 'antd';
import {
  ArrowClockwiseIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import dayjs, { type Dayjs } from 'dayjs';
import { PAYMENT_METHOD_LABELS, PRODUCT_UNIT_LABELS, SALE_TYPE_LABELS } from '@store/store-shared/core';
import type { ProductUnit, SaleListItem, SaleType } from '@store/store-shared/core';
import { formatDate } from '@store/store-shared/lib/formatters';
import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { StatusBadge } from '@store/store-shared/ui/status-badge';
import type { AnalyticsPeriod, AnalyticsQuery } from '@store/store-stub';
import { useSales } from '../sale/hooks/useSales';
import {
  useCustomerDebt,
  useDashboard,
  useExpenseReport,
  useInventoryReport,
  useSalesReport,
} from './hooks/useAnalyticsReports';

type Tab = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'debt';
type TFunc = (key: string) => string;
type DebtScope = 'overdue' | 'allDebt';
type DebtDeadlineFilter = 'all' | 'withDeadline' | 'withoutDeadline';
type DebtSort = 'dueDateAsc' | 'debtDesc' | 'lateDesc' | 'createdDesc';
type AnalyticsFiltersForm = {
  period: AnalyticsPeriod;
  dateRange: [Dayjs | null, Dayjs | null];
};

export interface AnalyticsWorkspaceProps {
  t: TFunc;
  branchId?: string;
}

export function AnalyticsWorkspace({ t, branchId }: AnalyticsWorkspaceProps) {
  //
  const [tab, setTab] = useState<Tab>('dashboard');
  const [overduePage, setOverduePage] = useState(1);
  const [overduePageSize, setOverduePageSize] = useState(10);
  const [debtScope, setDebtScope] = useState<DebtScope>('overdue');
  const [debtDeadlineFilter, setDebtDeadlineFilter] = useState<DebtDeadlineFilter>('all');
  const [debtSort, setDebtSort] = useState<DebtSort>('dueDateAsc');
  const [debtCustomerId, setDebtCustomerId] = useState<string | undefined>();
  const [debtSaleType, setDebtSaleType] = useState<SaleType | undefined>();
  const { control, watch } = useForm<AnalyticsFiltersForm>({
    defaultValues: {
      period: 'day',
      dateRange: [dayjs().startOf('month'), dayjs()],
    },
  });
  const { period, dateRange } = watch();

  const query: AnalyticsQuery = {
    branchId,
    from: dateRange[0]?.toISOString(),
    to: dateRange[1]?.toISOString(),
    period,
    limit: 10,
  };

  const dashboard = useDashboard(query);
  const salesReport = useSalesReport(query);
  const expenseReport = useExpenseReport(query);
  const inventoryReport = useInventoryReport(query);
  const customerDebt = useCustomerDebt(query);
  const debtSales = useSales({
    branchId: query.branchId,
    from: query.from,
    to: query.to,
    hasDebt: true,
    overdue: debtScope === 'overdue' ? true : undefined,
    customerId: debtCustomerId,
    saleType: debtSaleType,
  });

  useEffect(() => {
    //
    setOverduePage(1);
  }, [query.branchId, query.from, query.to, debtScope, debtDeadlineFilter, debtCustomerId, debtSaleType, debtSort]);

  const handleDebtScopeChange = (value: DebtScope) => {
    //
    setDebtScope(value);
    if (value === 'overdue' && debtDeadlineFilter === 'withoutDeadline') {
      setDebtDeadlineFilter('all');
    }
  };

  const handleDebtDeadlineChange = (value: DebtDeadlineFilter) => {
    //
    setDebtDeadlineFilter(value);
    if (value === 'withoutDeadline') setDebtScope('allDebt');
  };

  const refetchAll = () => {
    //
    dashboard.refetch();
    salesReport.refetch();
    expenseReport.refetch();
    inventoryReport.refetch();
    customerDebt.refetch();
    debtSales.refetch();
  };

  const anyFetching =
    dashboard.isFetching ||
    salesReport.isFetching ||
    expenseReport.isFetching ||
    inventoryReport.isFetching ||
    customerDebt.isFetching ||
    debtSales.isFetching;

  const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
    { value: 'day', label: t('analytics.periodDay') },
    { value: 'week', label: t('analytics.periodWeek') },
    { value: 'month', label: t('analytics.periodMonth') },
  ];

  const TABS: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: t('analytics.tabDashboard') },
    { key: 'sales', label: t('analytics.tabSales') },
    { key: 'expenses', label: t('analytics.tabExpenses') },
    { key: 'inventory', label: t('analytics.tabInventory') },
    { key: 'debt', label: t('analytics.tabDebt') },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('analytics.title')}</h1>
          <div className="sub">{t('analytics.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(value) => field.onChange(value ? [value[0], value[1]] : [null, null])}
                format="DD.MM.YYYY"
                presets={[
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
                  { label: t('analytics.lastMonth'), value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                  { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day'), dayjs()] },
                  { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day'), dayjs()] },
                ]}
              />
            )}
          />
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                options={PERIOD_OPTIONS}
                style={{ width: 120 }}
              />
            )}
          />
          <Button icon={<ArrowClockwiseIcon size={18} className={anyFetching ? 'ph-icon-spin' : undefined} />} onClick={refetchAll} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="analytics-tabs" role="tablist" aria-label={t('analytics.title')}>
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            role="tab"
            aria-selected={tab === tabItem.key}
            className={tab === tabItem.key ? 'is-active' : undefined}
            onClick={() => setTab(tabItem.key)}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ─────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <DashboardTab data={dashboard.data} loading={dashboard.isLoading} t={t} />
      )}

      {/* ── Sales ─────────────────────────────────────────────── */}
      {tab === 'sales' && (
        <SalesTab data={salesReport.data} loading={salesReport.isLoading} t={t} />
      )}

      {/* ── Expenses ──────────────────────────────────────────── */}
      {tab === 'expenses' && (
        <ExpensesTab data={expenseReport.data} loading={expenseReport.isLoading} t={t} />
      )}

      {/* ── Inventory ─────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <InventoryTab data={inventoryReport.data} loading={inventoryReport.isLoading} t={t} />
      )}

      {/* ── Customer Debt ─────────────────────────────────────── */}
      {tab === 'debt' && (
        <DebtTab
          data={customerDebt.data}
          loading={customerDebt.isLoading}
          t={t}
          debtSales={debtSales.data}
          debtLoading={debtSales.isLoading}
          debtFetching={debtSales.isFetching}
          overduePage={overduePage}
          overduePageSize={overduePageSize}
          debtScope={debtScope}
          debtDeadlineFilter={debtDeadlineFilter}
          debtSort={debtSort}
          debtCustomerId={debtCustomerId}
          debtSaleType={debtSaleType}
          onDebtScopeChange={handleDebtScopeChange}
          onDebtDeadlineChange={handleDebtDeadlineChange}
          onDebtSortChange={setDebtSort}
          onDebtCustomerChange={setDebtCustomerId}
          onDebtSaleTypeChange={setDebtSaleType}
          onOverduePageChange={(page, pageSize) => {
            //
            setOverduePage(page);
            setOverduePageSize(pageSize);
          }}
        />
      )}
    </>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ data, loading, t }: { data?: ReturnType<typeof useDashboard>['data']; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;
  const kpis = [
    { label: t('analytics.kpiRevenue'), value: <MoneyDisplay amount={data.sales.totalRevenue} currency="UZS" />, sub: `${data.sales.saleCount} ${t('analytics.saleSuffix')}`, tone: 'primary' as const },
    { label: t('analytics.kpiPaid'), value: <MoneyDisplay amount={data.sales.paidAmount} currency="UZS" />, sub: t('analytics.subCashCard'), tone: 'success' as const },
    { label: t('analytics.kpiSaleDebt'), value: <MoneyDisplay amount={data.sales.outstandingDebt} currency="UZS" />, sub: t('analytics.subUnpaid'), tone: 'danger' as const },
    { label: t('analytics.kpiExpenses'), value: <MoneyDisplay amount={data.expenses.total} currency="UZS" />, sub: t('analytics.subAllCategories'), tone: 'warning' as const },
    { label: t('analytics.kpiNetProfit'), value: <MoneyDisplay amount={data.profit.netProfit} currency="UZS" />, sub: t('analytics.subProfitFormula'), tone: data.profit.netProfit >= 0 ? 'success' as const : 'danger' as const },
    { label: t('analytics.kpiStockValue'), value: <MoneyDisplay amount={data.inventory.stockValueUzs} currency="UZS" />, sub: t('analytics.subAtCost'), tone: 'muted' as const },
    { label: t('analytics.kpiCustomerDebt'), value: <MoneyDisplay amount={data.customers.totalDebt} currency="UZS" />, sub: `${data.customers.debtorCount} ${t('analytics.debtorSuffix')}`, tone: 'danger' as const },
    { label: t('analytics.kpiLowStock'), value: data.inventory.lowStockCount, sub: t('analytics.subLowStock'), tone: data.inventory.lowStockCount > 0 ? 'warning' as const : 'success' as const },
    { label: t('analytics.kpiPendingTransfers'), value: data.transfers.pendingCount, sub: t('analytics.subNeedReview'), tone: data.transfers.pendingCount > 0 ? 'warning' as const : 'success' as const },
  ];
  const revenueBase = Math.max(data.sales.totalRevenue, 1);
  const financialRows = [
    { label: t('analytics.kpiPaid'), value: data.sales.paidAmount, pct: (data.sales.paidAmount / revenueBase) * 100, tone: 'var(--success)' },
    { label: t('analytics.kpiSaleDebt'), value: data.sales.outstandingDebt, pct: (data.sales.outstandingDebt / revenueBase) * 100, tone: 'var(--danger)' },
    { label: t('analytics.kpiExpenses'), value: data.expenses.total, pct: (data.expenses.total / revenueBase) * 100, tone: 'var(--warning)' },
    { label: t('analytics.kpiNetProfit'), value: data.profit.netProfit, pct: (Math.abs(data.profit.netProfit) / revenueBase) * 100, tone: data.profit.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' },
  ];

  return (
    <div className="analytics-overview">
      <div className="analytics-overview-grid">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="analytics-overview-details">
        <section className="card analytics-overview-panel">
          <SectionTitle>{t('analytics.financialSummary')}</SectionTitle>
          <div className="analytics-overview-finance">
            {financialRows.map((row) => (
              <div className="analytics-overview-finance__row" key={row.label}>
                <div className="analytics-overview-finance__head">
                  <span>{row.label}</span>
                  <strong><MoneyDisplay amount={row.value} currency="UZS" /></strong>
                </div>
                <div className="analytics-overview-finance__track">
                  <span style={{ width: `${Math.min(row.pct, 100)}%`, background: row.tone }} />
                </div>
                <small>{Math.round(row.pct)}%</small>
              </div>
            ))}
          </div>
        </section>
        <section className="card analytics-overview-panel">
          <SectionTitle>{t('analytics.operationalSummary')}</SectionTitle>
          <div className="analytics-overview-status">
            <div><span>{t('analytics.kpiStockValue')}</span><strong><MoneyDisplay amount={data.inventory.stockValueUzs} currency="UZS" /></strong></div>
            <div><span>{t('analytics.kpiLowStock')}</span><strong className={data.inventory.lowStockCount > 0 ? 'is-warning' : 'is-success'}>{data.inventory.lowStockCount}</strong></div>
            <div><span>{t('analytics.kpiPendingTransfers')}</span><strong className={data.transfers.pendingCount > 0 ? 'is-warning' : 'is-success'}>{data.transfers.pendingCount}</strong></div>
            <div><span>{t('analytics.kpiCustomerDebt')}</span><strong className={data.customers.debtorCount > 0 ? 'is-danger' : 'is-success'}>{data.customers.debtorCount} {t('analytics.debtorSuffix')}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────────

function SalesTab({ data, loading, t }: { data?: ReturnType<typeof useSalesReport>['data']; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />;

  const grandTotal = data.summary.totalRevenue || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Summary row */}
      <div className="analytics-sales-kpis">
        <KpiCard label={t('analytics.kpiRevenue')} value={<MoneyDisplay amount={data.summary.totalRevenue} currency="UZS" />} sub={`${data.summary.saleCount} ${t('analytics.saleSuffix')}`} tone="primary" />
        <KpiCard label={t('analytics.avgSale')} value={<MoneyDisplay amount={data.summary.avgOrderValue} currency="UZS" />} sub={t('analytics.subPerSale')} tone="muted" />
        <KpiCard label={t('analytics.kpiDebtShort')} value={<MoneyDisplay amount={data.summary.outstandingDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* By type */}
        <div className="card">
          <SectionTitle>{t('analytics.byType')}</SectionTitle>
          {data.byType.map((r) => {
            //
            const pct = (r.revenue / grandTotal) * 100;
            return (
              <div key={r.saleType} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{SALE_TYPE_LABELS[r.saleType]} ({r.count} {t('common.countSuffix')})</span>
                  <span className="num"><MoneyDisplay amount={r.revenue} currency="UZS" /></span>
                </div>
                <ProgressBar pct={pct} />
              </div>
            );
          })}
        </div>

        {/* By payment method */}
        <div className="card">
          <SectionTitle>{t('analytics.byPayment')}</SectionTitle>
          {data.byPaymentMethod.map((r) => {
            //
            const pct = (r.amount / grandTotal) * 100;
            return (
              <div key={r.paymentMethod} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{PAYMENT_METHOD_LABELS[r.paymentMethod]} ({r.count})</span>
                  <span className="num"><MoneyDisplay amount={r.amount} currency="UZS" /></span>
                </div>
                <ProgressBar pct={pct} />
              </div>
            );
          })}
          {data.byPaymentMethod.length === 0 && <Empty t={t} />}
        </div>
      </div>

      {/* Top products */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>
          {t('analytics.topProducts')}
        </div>
        <Table
          size="small"
          pagination={false}
          rowKey="productId"
          dataSource={data.topProducts}
          columns={[
            { title: t('analytics.colProduct'), key: 'name', render: (_, r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                {r.sku && <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{r.sku}</div>}
              </div>
            )},
            { title: t('analytics.colQty'), key: 'qty', width: 120, align: 'right', render: (_, r) => (
              <span className="num">{r.totalQuantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[r.unit as ProductUnit] ?? r.unit}</span>
            )},
            { title: t('analytics.colRevenue'), key: 'rev', width: 160, align: 'right', render: (_, r) => (
              <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={r.totalRevenue} currency="UZS" /></span>
            )},
          ]}
        />
      </div>
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function ExpensesTab({ data, loading, t }: { data?: ReturnType<typeof useExpenseReport>['data']; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  const grandTotal = data.summary.total || 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, alignItems: 'flex-start' }}>
      {/* Period chart (bar) */}
      <div className="card">
        <SectionTitle>{t('analytics.byPeriod')}</SectionTitle>
        {data.byPeriod.length === 0 ? (
          <Empty t={t} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.byPeriod.map((r, i) => {
              //
              const pct = (r.amount / Math.max(...data.byPeriod.map((x) => x.amount))) * 100;
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 140px', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{formatDate(String(r.period))}</span>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
                  </div>
                  <span className="num" style={{ textAlign: 'right' }}><MoneyDisplay amount={r.amount} currency="UZS" /></span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* By category */}
      <div className="card">
        <SectionTitle>{t('nav.categories')}</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.byCategory.map((c) => {
            //
            const pct = (c.amount / grandTotal) * 100;
            return (
              <div key={c.categoryId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{c.categoryName}</span>
                  <span className="num" style={{ color: 'var(--ink-3)' }}>{pct.toFixed(0)}%</span>
                </div>
                <ProgressBar pct={pct} />
                <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                  <MoneyDisplay amount={c.amount} currency="UZS" />
                </div>
              </div>
            );
          })}
          {data.byCategory.length === 0 && <Empty t={t} />}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--ink-3)' }}>{t('common.total')}</span>
          <span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={data.summary.total} currency="UZS" /></span>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────

function InventoryTab({ data, loading, t }: { data?: ReturnType<typeof useInventoryReport>['data']; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div className="analytics-inventory">
      {/* Stock by branch */}
      <div className="analytics-inventory-branches">
        {data.stockByBranch.map((b) => (
          <div key={b.branchId} className="card analytics-inventory-branch">
            <div className="analytics-inventory-branch__name">
              {b.branchName}
            </div>
            <div className="analytics-inventory-branch__value num">
              <MoneyDisplay amount={b.stockValueUzs} currency="UZS" />
            </div>
            <div className="analytics-inventory-branch__meta">
              {b.productCount} {t('analytics.skuSuffix')} · {b.totalQuantity.toLocaleString('ru-RU')} {t('analytics.pieceSuffix')}
            </div>
          </div>
        ))}
        {data.stockByBranch.length === 0 && (
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('analytics.noInventoryData')}</div>
        )}
      </div>

      <div className="analytics-inventory-details">
        {/* Low stock */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningIcon size={18} weight="duotone" color="currentColor" style={{ color: 'var(--warning)' }} />
            <span style={{ fontWeight: 700, fontSize: 13 }}>{t('analytics.lowStockItems')} ({data.lowStock.length})</span>
          </div>
          {data.lowStock.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--ink-3)', fontSize: 13 }}>{t('analytics.allSufficient')}</div>
          ) : (
            <Table
              size="small"
              pagination={false}
              rowKey={(r) => `${r.productId}-${r.branchId}`}
              dataSource={data.lowStock}
              columns={[
                { title: t('analytics.colProduct'), key: 'name', render: (_, r) => (
                  <div>
                    <div style={{ fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.branchName}</div>
                  </div>
                )},
                { title: t('analytics.colRemaining'), key: 'stock', width: 130, align: 'right', render: (_, r) => (
                  <span className="num" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                    {r.currentStock} / {r.threshold} {PRODUCT_UNIT_LABELS[r.unit as ProductUnit] ?? r.unit}
                  </span>
                )},
              ]}
            />
          )}
        </div>

        {/* Movement summary */}
        <div className="card analytics-inventory-movements">
          <SectionTitle>{t('analytics.movementSummary')}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.movementSummary.map((m) => {
              //
              const MOVEMENT_LABELS: Record<string, string> = {
                STOCK_IN: t('analytics.movStockIn'),
                STOCK_OUT: t('analytics.movStockOut'),
                ADJUSTMENT: t('analytics.movAdjust'),
                TRANSFER_IN: t('analytics.movTransferIn'),
                TRANSFER_OUT: t('analytics.movTransferOut'),
              };
              return (
                <div key={m.type} className="analytics-inventory-movement">
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{MOVEMENT_LABELS[m.type] ?? m.type}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontWeight: 700 }}>{m.totalQuantity.toLocaleString('ru-RU')}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{m.count} {t('analytics.operationSuffix')}</div>
                  </div>
                </div>
              );
            })}
            {data.movementSummary.length === 0 && <Empty t={t} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Debt Tab ─────────────────────────────────────────────────────────────────

function DebtTab({
  data,
  loading,
  t,
  debtSales,
  debtLoading,
  debtFetching,
  overduePage,
  overduePageSize,
  debtScope,
  debtDeadlineFilter,
  debtSort,
  debtCustomerId,
  debtSaleType,
  onDebtScopeChange,
  onDebtDeadlineChange,
  onDebtSortChange,
  onDebtCustomerChange,
  onDebtSaleTypeChange,
  onOverduePageChange,
}: {
  data?: ReturnType<typeof useCustomerDebt>['data'];
  loading: boolean;
  t: TFunc;
  debtSales?: ReturnType<typeof useSales>['data'];
  debtLoading: boolean;
  debtFetching: boolean;
  overduePage: number;
  overduePageSize: number;
  debtScope: DebtScope;
  debtDeadlineFilter: DebtDeadlineFilter;
  debtSort: DebtSort;
  debtCustomerId?: string;
  debtSaleType?: SaleType;
  onDebtScopeChange: (value: DebtScope) => void;
  onDebtDeadlineChange: (value: DebtDeadlineFilter) => void;
  onDebtSortChange: (value: DebtSort) => void;
  onDebtCustomerChange: (value?: string) => void;
  onDebtSaleTypeChange: (value?: SaleType) => void;
  onOverduePageChange: (page: number, pageSize: number) => void;
}) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  const debtRows = [...(debtSales ?? [])]
    .filter((sale) => {
      //
      if (debtDeadlineFilter === 'withDeadline') return Boolean(sale.debtDueDate);
      if (debtDeadlineFilter === 'withoutDeadline') return !sale.debtDueDate;
      return true;
    })
    .sort((a, b) => sortDebtRows(a, b, debtSort));
  const debtTotal = debtRows.length;
  const tableTitle = debtScope === 'overdue' ? t('analytics.overduePayments') : t('analytics.debtPayments');
  const emptyText = debtScope === 'overdue' ? t('analytics.noOverduePayments') : t('analytics.noDebtPayments');
  const topDebtorOptions = data.topDebtors.map((customer) => ({
    value: customer.id,
    searchLabel: customer.fullName,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {customer.fullName}
        </span>
        <span className="num" style={{ color: 'var(--danger)', fontWeight: 700, flex: '0 0 auto' }}>
          {formatCompactAmount(customer.balance)}
        </span>
      </span>
    ),
  }));

  return (
    <div className="analytics-debt">
      {/* Summary */}
      <div className="analytics-debt-kpis">
        <KpiCard label={t('analytics.totalDebt')} value={<MoneyDisplay amount={data.summary.totalDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
        <KpiCard label={t('analytics.overdueDebt')} value={<MoneyDisplay amount={data.overdue.totalOverdueDebt} currency="UZS" />} sub={`${data.overdue.overdueCount} ${t('analytics.saleSuffix')}`} tone="danger" />
        <KpiCard label={t('dashboard.debtorCount')} value={data.summary.debtorCount} sub={t('analytics.debtorsNeedAttention')} tone={data.summary.debtorCount > 0 ? 'warning' : 'success'} />
      </div>

      {data.overdue.overdueCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${data.overdue.overdueCount} ${t('analytics.alertOverdueSuffix')}`}
        />
      )}

      {/* Debt payments */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
            <WarningIcon size={18} weight="duotone" color="currentColor" style={{ color: 'var(--warning)' }} />
            {tableTitle}
          </div>
          <span style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{debtTotal}</strong> {t('common.resultsSuffix')}
          </span>
        </div>
        <div className="analytics-debt-filters">
          <Select<DebtScope>
            value={debtScope}
            onChange={onDebtScopeChange}
            style={{ width: '100%' }}
            options={[
              { value: 'overdue', label: t('analytics.scopeOverdue') },
              { value: 'allDebt', label: t('analytics.scopeAllDebt') },
            ]}
          />
          <Select<DebtDeadlineFilter>
            value={debtDeadlineFilter}
            onChange={onDebtDeadlineChange}
            style={{ width: '100%' }}
            options={[
              { value: 'all', label: t('analytics.deadlineAll') },
              { value: 'withDeadline', label: t('analytics.deadlineSet') },
              { value: 'withoutDeadline', label: t('analytics.deadlineMissing') },
            ]}
          />
          <Select
            value={debtCustomerId}
            onChange={onDebtCustomerChange}
            allowClear
            showSearch
            optionFilterProp="searchLabel"
            placeholder={t('analytics.filterTopDebtors')}
            className="analytics-debt-filters__customer"
            style={{ width: '100%' }}
            options={topDebtorOptions}
          />
          <Select<SaleType>
            value={debtSaleType}
            onChange={onDebtSaleTypeChange}
            allowClear
            placeholder={t('sales.filterAllTypes')}
            style={{ width: '100%' }}
            options={[
              { value: 'RETAIL', label: t('sales.typeRetail') },
              { value: 'WHOLESALE', label: t('sales.typeWholesale') },
            ]}
          />
          <Select<DebtSort>
            value={debtSort}
            onChange={onDebtSortChange}
            style={{ width: '100%' }}
            options={[
              { value: 'dueDateAsc', label: t('analytics.sortDueDateAsc') },
              { value: 'debtDesc', label: t('analytics.sortDebtDesc') },
              { value: 'lateDesc', label: t('analytics.sortLateDesc') },
              { value: 'createdDesc', label: t('analytics.sortCreatedDesc') },
            ]}
          />
        </div>
        <Table<SaleListItem>
          size="small"
          rowKey="id"
          loading={debtLoading || debtFetching}
          dataSource={debtRows}
          scroll={{ x: 980 }}
          locale={{ emptyText }}
          pagination={{
            current: overduePage,
            pageSize: overduePageSize,
            total: debtTotal,
            onChange: onOverduePageChange,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          columns={[
            { title: '#', key: '_idx', width: 52, align: 'center', render: (_, __, index) => (
              <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                {(overduePage - 1) * overduePageSize + index + 1}
              </span>
            )},
            { title: t('analytics.colCustomer'), key: 'customer', render: (_, sale) => (
              sale.customer ? (
                <div>
                  <div style={{ fontWeight: 600 }}>{sale.customer.fullName}</div>
                </div>
              ) : (
                <span style={{ color: 'var(--ink-4)' }}>{t('sales.anonymous')}</span>
              )
            )},
            { title: t('analytics.colPhone'), key: 'phone', width: 150, render: (_, sale) => (
              sale.customer?.phone ? (
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{sale.customer.phone}</span>
              ) : (
                <span style={{ color: 'var(--ink-4)' }}>—</span>
              )
            )},
            { title: t('analytics.colBranch'), key: 'branch', width: 140, render: (_, sale) => (
              <StatusBadge tone="muted">{sale.branch.name}</StatusBadge>
            )},
            { title: t('analytics.colDueDate'), key: 'dueDate', width: 150, render: (_, sale) => (
              <div>
                <div style={{ fontWeight: 700, color: sale.debtDueDate ? 'var(--danger)' : 'var(--ink-4)' }}>
                  {sale.debtDueDate ? formatDate(sale.debtDueDate) : t('analytics.noDeadline')}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{t('common.date')}: {formatDate(sale.createdAt)}</div>
              </div>
            )},
            { title: t('analytics.colOverdueBy'), key: 'lateBy', width: 130, align: 'center', render: (_, sale) => (
              sale.debtDueDate ? (
                <StatusBadge tone="danger" dot>
                  {getLateDays(sale.debtDueDate)} {t('analytics.daysLateSuffix')}
                </StatusBadge>
              ) : (
                <StatusBadge tone="muted">{t('analytics.noDeadline')}</StatusBadge>
              )
            )},
            { title: t('analytics.colDebt'), key: 'debt', width: 170, align: 'right', render: (_, sale) => (
              <span className="num" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                <MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />
              </span>
            )},
          ]}
        />
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const TONE_COLORS: Record<string, string> = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning, #f59e0b)',
  muted: 'var(--ink-2)',
};

function KpiCard({ label, value, sub, tone = 'muted' }: { label: string; value: ReactNode; sub: string; tone?: string }) {
  //
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, fontWeight: 700, color: TONE_COLORS[tone] }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  //
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{children}</div>
  );
}

function Empty({ t }: { t: TFunc }) {
  //
  return <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>{t('common.noData')}</div>;
}

function sortDebtRows(a: SaleListItem, b: SaleListItem, sort: DebtSort) {
  //
  if (sort === 'debtDesc') {
    return b.debtAmountUzs - a.debtAmountUzs || compareDueDate(a, b);
  }

  if (sort === 'lateDesc') {
    return getSortableLateDays(b) - getSortableLateDays(a) || b.debtAmountUzs - a.debtAmountUzs;
  }

  if (sort === 'createdDesc') {
    return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
  }

  return compareDueDate(a, b);
}

function compareDueDate(a: SaleListItem, b: SaleListItem) {
  //
  return getDueTime(a) - getDueTime(b) || b.debtAmountUzs - a.debtAmountUzs;
}

function getDueTime(sale: SaleListItem) {
  //
  return sale.debtDueDate ? dayjs(sale.debtDueDate).valueOf() : Number.MAX_SAFE_INTEGER;
}

function getSortableLateDays(sale: SaleListItem) {
  //
  return sale.debtDueDate ? getLateDays(sale.debtDueDate) : -1;
}

function getLateDays(dueDate: string) {
  //
  return Math.max(0, dayjs().startOf('day').diff(dayjs(dueDate).startOf('day'), 'day'));
}

function formatCompactAmount(amount: number) {
  //
  const abs = Math.abs(amount);
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${Math.round(abs / 1e3)}K`;
  return String(abs);
}
