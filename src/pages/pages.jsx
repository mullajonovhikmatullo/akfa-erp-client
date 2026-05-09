/**
 * pages/pages.jsx — route-level pages. Compose features only.
 */

import dayjs from 'dayjs';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { Avatar, TagPill, Money, SectionTitle, EmptyState } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';
import { KpiCard, RevenueChart, ProfitBars, useDailySeries } from '../widgets/widgets.jsx';

const DashboardPage = () => {
  const t = useT();
  const user = useSel(sel.user);
  const isSuper = useSel(sel.isSuper);
  const branches = useSel(s => s.branches);
  const sales = useSel(s => s.sales);
  const expenses = useSel(s => s.expenses);
  const customers = useSel(s => s.customers);
  const products = useSel(s => s.products);
  const stock = useSel(s => s.stock);
  const rate = useSel(s => s.settings.exchangeRate);
  const activeBranchId = useSel(sel.activeBranchId);

  const branchFilter = isSuper && activeBranchId === "__all__" ? null : activeBranchId;
  const series = useDailySeries(branchFilter);

  const todayIso = dayjs().format("YYYY-MM-DD");
  const todaySales = sales.filter(s => s.date === todayIso && (!branchFilter || s.branchId === branchFilter));
  const todayRevenue = todaySales.reduce((a, s) => a + s.items.reduce((b, it) => b + fmt.toUZS(it.qty * it.price, s.currency, rate), 0), 0);

  const monthIso = dayjs().format("YYYY-MM");
  const monthSales = sales.filter(s => s.date.startsWith(monthIso) && (!branchFilter || s.branchId === branchFilter));
  const monthRevenue = monthSales.reduce((a, s) => a + s.items.reduce((b, it) => b + fmt.toUZS(it.qty * it.price, s.currency, rate), 0), 0);
  const monthExpenses = expenses.filter(e => e.date.startsWith(monthIso) && (!branchFilter || e.branchId === branchFilter)).reduce((a, e) => a + fmt.toUZS(e.amount, e.currency, rate), 0);

  const totalDebt = customers.reduce((a, c) => a + (c.balance < 0 ? -c.balance : 0), 0);

  // Low stock alerts
  const lowThreshold = useSel(s => s.settings.lowStockThreshold);
  const lowStock = products.map(p => ({ ...p, total: Object.values(stock).reduce((a, b) => a + (b[p.id] || 0), 0) }))
    .filter(p => p.total < lowThreshold).slice(0, 5);

  // Recent sales
  const recentSales = (branchFilter ? sales.filter(s => s.branchId === branchFilter) : sales).slice(0, 6);
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋</h1>
          <div className="sub">
            {isSuper ? "You're viewing the global cockpit. " : "Branch view. "}
            {fmt.fmtDate(todayIso)} · last sync just now.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <antd.Button icon={<icons.PlusOutlined />} onClick={() => window.location.hash = "#/sales"}>New sale</antd.Button>
          <antd.Button icon={<icons.DropboxOutlined />} onClick={() => window.location.hash = "#/purchases"}>Receive stock</antd.Button>
          <antd.Button type="primary" icon={<icons.LineChartOutlined />} onClick={() => window.location.hash = "#/analytics"}>Open analytics</antd.Button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <KpiCard label={t("common.today") + " · revenue"} value={<Money amount={todayRevenue} currency="UZS" compact />} delta={`${todaySales.length} sales`} deltaUp hint="Real-time" sparkline={series.slice(-7).map(d => d.revenue)} />
        <KpiCard label={t("common.thisMonth") + " · revenue"} value={<Money amount={monthRevenue} currency="UZS" compact />} delta={`${monthSales.length} sales`} deltaUp hint="MTD" sparkline={series.map(d => d.revenue)} />
        <KpiCard label={t("common.thisMonth") + " · expenses"} value={<Money amount={monthExpenses} currency="UZS" compact />} delta="overhead" deltaUp={false} hint="MTD" sparkline={series.map(d => d.expenses)} />
        <KpiCard label={t("common.debts")} value={<Money amount={-totalDebt} currency="UZS" compact />} delta={`${customers.filter(c => c.balance < 0).length} debtors`} deltaUp={false} hint="Receivables" />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Revenue & expenses</h3><span className="meta">14 days · UZS</span></div>
          <RevenueChart branchId={branchFilter} />
        </div>
        <div className="card">
          <div className="card-head"><h3>Daily profit</h3><span className="meta">Net per day</span></div>
          <ProfitBars branchId={branchFilter} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h3>Recent sales</h3><a href="#/sales" style={{ fontSize: 12, color: "var(--primary)" }}>View all →</a></div>
          <div className="col" style={{ gap: 8 }}>
            {recentSales.map(s => {
              const total = s.items.reduce((a, it) => a + it.qty * it.price, 0);
              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, alignItems: "center" }}>
                  <Avatar name={customerMap[s.customerId]?.name} tone="#1e4dd8" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customerMap[s.customerId]?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      #{s.id.toUpperCase()} · {s.items.length} items · {fmt.fmtDate(s.date)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="num" style={{ fontWeight: 600 }}><Money amount={total} currency={s.currency} /></div>
                    <TagPill tone={s.priceMode === "wholesale" ? "info" : "muted"}>{s.priceMode}</TagPill>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Low stock alerts</h3><a href="#/products" style={{ fontSize: 12, color: "var(--primary)" }}>Manage →</a></div>
          {lowStock.length === 0 ? (
            <EmptyState title="All good" hint="No SKUs below the low-stock threshold." />
          ) : (
            <div className="col" style={{ gap: 8 }}>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, alignItems: "center", background: "#fff7f5" }}>
                  <div className="placeholder-img" style={{ width: 36, height: 36, fontSize: 9 }}>IMG</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="num">{p.sku}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="num" style={{ fontWeight: 700, color: "var(--danger)" }}>{p.total} {p.unit}</div>
                    <TagPill tone="danger">below {lowThreshold}</TagPill>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SectionTitle>Quick actions</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <antd.Button icon={<icons.SwapOutlined />} onClick={() => window.location.hash = "#/transfers"}>New transfer</antd.Button>
            <antd.Button icon={<icons.WalletOutlined />} onClick={() => window.location.hash = "#/expenses"}>Log expense</antd.Button>
            <antd.Button icon={<icons.TeamOutlined />} onClick={() => window.location.hash = "#/customers"}>Add customer</antd.Button>
            <antd.Button icon={<icons.InboxOutlined />} onClick={() => window.location.hash = "#/products"}>Add product</antd.Button>
          </div>
        </div>
      </div>
    </>
  );
};

export { DashboardPage };
