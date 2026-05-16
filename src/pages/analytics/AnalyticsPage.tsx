import { useState } from 'react';
import { Button, DatePicker, Select, Skeleton, Table, Alert } from 'antd';
import {
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  useDashboard,
  useSalesReport,
  useExpenseReport,
  useInventoryReport,
  useCustomerDebt,
  type AnalyticsPeriod,
  type AnalyticsQuery,
} from '@/entities/analytics';
import { MoneyDisplay, StatusBadge } from '@/shared/ui';
import { SALE_TYPE_LABELS, PAYMENT_METHOD_LABELS, PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ProductUnit } from '@/shared/types/domain';
import { formatDate } from '@/shared/lib/formatters';
import { useT } from '@/shared/lib/i18n';

type Tab = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'debt';
type TFunc = (key: string) => string;

export function AnalyticsPage() {
  const t = useT();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [period, setPeriod] = useState<AnalyticsPeriod>('day');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const query: AnalyticsQuery = {
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

  const refetchAll = () => {
    dashboard.refetch();
    salesReport.refetch();
    expenseReport.refetch();
    inventoryReport.refetch();
    customerDebt.refetch();
  };

  const anyFetching =
    dashboard.isFetching ||
    salesReport.isFetching ||
    expenseReport.isFetching ||
    inventoryReport.isFetching ||
    customerDebt.isFetching;

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
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(v) => setDateRange(v as [Dayjs | null, Dayjs | null])}
            format="DD.MM.YYYY"
            presets={[
              { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
              { label: t('analytics.lastMonth'), value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day'), dayjs()] },
              { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day'), dayjs()] },
            ]}
          />
          <Select
            value={period}
            onChange={setPeriod}
            options={PERIOD_OPTIONS}
            style={{ width: 120 }}
          />
          <Button icon={<ReloadOutlined spin={anyFetching} />} onClick={refetchAll} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: tab === tabItem.key ? 700 : 400,
              color: tab === tabItem.key ? 'var(--primary)' : 'var(--ink-3)',
              borderBottom: tab === tabItem.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
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
        <DebtTab data={customerDebt.data} loading={customerDebt.isLoading} t={t} />
      )}
    </>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ data, loading, t }: { data?: ReturnType<typeof useDashboard>['data']; loading: boolean; t: TFunc }) {
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
      {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────────

function SalesTab({ data, loading, t }: { data?: ReturnType<typeof useSalesReport>['data']; loading: boolean; t: TFunc }) {
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />;

  const grandTotal = data.summary.totalRevenue || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KpiCard label={t('analytics.kpiRevenue')} value={<MoneyDisplay amount={data.summary.totalRevenue} currency="UZS" />} sub={`${data.summary.saleCount} ${t('analytics.saleSuffix')}`} tone="primary" />
        <KpiCard label={t('analytics.avgSale')} value={<MoneyDisplay amount={data.summary.avgOrderValue} currency="UZS" />} sub={t('analytics.subPerSale')} tone="muted" />
        <KpiCard label={t('analytics.kpiDebtShort')} value={<MoneyDisplay amount={data.summary.outstandingDebt} currency="UZS" />} sub={t('analytics.subUnpaid')} tone="danger" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* By type */}
        <div className="card">
          <SectionTitle>{t('analytics.byType')}</SectionTitle>
          {data.byType.map((r) => {
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
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  const grandTotal = data.summary.total || 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'flex-start' }}>
      {/* Period chart (bar) */}
      <div className="card">
        <SectionTitle>{t('analytics.byPeriod')}</SectionTitle>
        {data.byPeriod.length === 0 ? (
          <Empty t={t} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.byPeriod.map((r, i) => {
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
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stock by branch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {data.stockByBranch.map((b) => (
          <div key={b.branchId} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
              {b.branchName}
            </div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              <MoneyDisplay amount={b.stockValueUzs} currency="UZS" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {b.productCount} {t('analytics.skuSuffix')} · {b.totalQuantity.toLocaleString('ru-RU')} {t('analytics.pieceSuffix')}
            </div>
          </div>
        ))}
        {data.stockByBranch.length === 0 && (
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('analytics.noInventoryData')}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Low stock */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: 'var(--warning)' }} />
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
        <div className="card">
          <SectionTitle>{t('analytics.movementSummary')}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.movementSummary.map((m) => {
              const MOVEMENT_LABELS: Record<string, string> = {
                STOCK_IN: t('analytics.movStockIn'),
                STOCK_OUT: t('analytics.movStockOut'),
                ADJUSTMENT: t('analytics.movAdjust'),
                TRANSFER_IN: t('analytics.movTransferIn'),
                TRANSFER_OUT: t('analytics.movTransferOut'),
              };
              return (
                <div key={m.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
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

function DebtTab({ data, loading, t }: { data?: ReturnType<typeof useCustomerDebt>['data']; loading: boolean; t: TFunc }) {
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        <KpiCard label={t('analytics.totalDebt')} value={<MoneyDisplay amount={data.summary.totalDebt} currency="UZS" />} sub={`${data.summary.debtorCount} ${t('analytics.debtorSuffix')}`} tone="danger" />
        <KpiCard label={t('analytics.overdueDebt')} value={<MoneyDisplay amount={data.overdue.totalOverdueDebt} currency="UZS" />} sub={`${data.overdue.overdueCount} ${t('analytics.saleSuffix')}`} tone="danger" />
      </div>

      {data.overdue.overdueCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${data.overdue.overdueCount} ${t('analytics.alertOverdueSuffix')}`}
        />
      )}

      {/* Top debtors */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>
          {t('analytics.topDebtors')}
        </div>
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={data.topDebtors}
          columns={[
            { title: t('analytics.colCustomer'), key: 'name', render: (_, c) => (
              <div>
                <div style={{ fontWeight: 600 }}>{c.fullName}</div>
                {c.phone && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{c.phone}</div>}
              </div>
            )},
            { title: t('analytics.colBranch'), key: 'branch', width: 140, render: (_, c) => (
              <StatusBadge tone="muted">{c.branch.name}</StatusBadge>
            )},
            { title: t('analytics.colDebt'), key: 'balance', width: 160, align: 'right', render: (_, c) => (
              <span className="num" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                <MoneyDisplay amount={c.balance} currency="UZS" />
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

function KpiCard({ label, value, sub, tone = 'muted' }: { label: string; value: React.ReactNode; sub: string; tone?: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: TONE_COLORS[tone] }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{children}</div>
  );
}

function Empty({ t }: { t: TFunc }) {
  return <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>{t('common.noData')}</div>;
}
