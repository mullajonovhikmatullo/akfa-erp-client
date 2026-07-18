/**
 * features/analytics.jsx — global / per-branch insights.
 *
 * Super Admin: revenue vs expenses, profit, debts/credits, branch breakdown.
 * Branch Admin: same but scoped to their branch.
 */

import { Controller, useForm } from 'react-hook-form';
import * as antd from 'antd';
import { useSel, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { Money } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';
import { KpiCard, RevenueChart, ProfitBars, CategoryDonut, useDailySeries } from '../widgets/widgets.jsx';

const AnalyticsFeature = () => {
  const t = useT();
  const isSuper = useSel(sel.isSuper);
  const activeBranchId = useSel(sel.activeBranchId);
  const branches = useSel(s => s.branches);
  const sales = useSel(s => s.sales);
  const expenses = useSel(s => s.expenses);
  const customers = useSel(s => s.customers);
  const products = useSel(s => s.products);
  const rate = useSel(s => s.settings.exchangeRate);

  const { control } = useForm({ defaultValues: { period: "month" } });

  const branchFilter = isSuper && activeBranchId === "__all__" ? null : activeBranchId;
  const series = useDailySeries(branchFilter);

  const totalRevenue = series.reduce((a, d) => a + d.revenue, 0);
  const totalExpenses = series.reduce((a, d) => a + d.expenses, 0);
  const totalCost = series.reduce((a, d) => a + d.cost, 0);
  const profit = totalRevenue - totalCost - totalExpenses;
  const margin = totalRevenue ? (profit / totalRevenue) * 100 : 0;

  const totalDebt = customers.reduce((a, c) => a + (c.balance < 0 ? -c.balance : 0), 0);
  const totalCredit = customers.reduce((a, c) => a + (c.balance > 0 ? c.balance : 0), 0);

  // Branch breakdown
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const byBranch = branches.map(b => {
    const rev = sales.filter(s => s.branchId === b.id).reduce((a, s) =>
      a + s.items.reduce((b2, it) => b2 + fmt.toUZS(it.qty * it.price, s.currency, rate), 0), 0);
    const exp = expenses.filter(e => e.branchId === b.id).reduce((a, e) => a + fmt.toUZS(e.amount, e.currency, rate), 0);
    return { ...b, revenue: rev, expenses: exp, profit: rev - exp };
  });

  // Top products by revenue
  const productRev = {};
  sales.forEach(s => s.items.forEach(it => {
    const v = fmt.toUZS(it.qty * it.price, s.currency, rate);
    productRev[it.productId] = (productRev[it.productId] || 0) + v;
  }));
  const topProducts = Object.entries(productRev)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, v]) => ({ ...productMap[id], revenue: v }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.analytics")}</h1>
          <div className="sub">{isSuper ? "Global view across all branches" : `Branch view · ${branches.find(b => b.id === activeBranchId)?.name}`}</div>
        </div>
        <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <antd.Segmented
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "Today", value: "day" },
                { label: "Week",  value: "week" },
                { label: "Month", value: "month" },
                { label: "Year",  value: "year" },
              ]}
            />
          )}
        />
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <KpiCard label="Revenue" value={<Money amount={totalRevenue} currency="UZS" compact />} delta="+18.2%" deltaUp hint="14d trailing" sparkline={series.map(d => d.revenue)} />
        <KpiCard label="Expenses" value={<Money amount={totalExpenses} currency="UZS" compact />} delta="+4.1%" deltaUp={false} hint="14d trailing" sparkline={series.map(d => d.expenses)} />
        <KpiCard label="Net profit" value={<Money amount={profit} currency="UZS" compact />} delta={`${margin.toFixed(1)}% margin`} deltaUp={profit > 0} hint="Revenue − cost − overhead" sparkline={series.map(d => d.profit)} />
        <KpiCard label="A/R balance"
          value={<Money amount={-totalDebt + totalCredit} currency="UZS" compact />}
          delta={`${customers.filter(c => c.balance < 0).length} debtors`} deltaUp={false}
          hint={`Credits ${fmt.fmtCompactUZS(totalCredit)}`} />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Revenue vs expenses · 14 days</h3>
            <span className="meta">UZS · daily</span>
          </div>
          <RevenueChart branchId={branchFilter} />
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Daily profit</h3>
            <span className="meta">Green = positive</span>
          </div>
          <ProfitBars branchId={branchFilter} />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Revenue by category</h3>
            <span className="meta">All-time</span>
          </div>
          <CategoryDonut />
        </div>

        {isSuper && (
          <div className="card">
            <div className="card-head"><h3>Branch performance</h3><span className="meta">Revenue vs expenses</span></div>
            <div className="col" style={{ gap: 12 }}>
              {byBranch.map(b => {
                const max = Math.max(...byBranch.map(x => x.revenue), 1);
                const revPct = (b.revenue / max) * 100;
                const expPct = (b.expenses / max) * 100;
                return (
                  <div key={b.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <strong>{b.name}</strong>
                      <span className="num" style={{ color: b.profit > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                        <Money amount={b.profit} currency="UZS" compact />
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${revPct}%`, height: "100%", background: "var(--primary)" }} />
                      </div>
                      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${expPct}%`, height: "100%", background: "var(--danger)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>
                      <span>Revenue <Money amount={b.revenue} currency="UZS" compact /></span>
                      <span>Expenses <Money amount={b.expenses} currency="UZS" compact /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head"><h3>Top products by revenue</h3><span className="meta">Lifetime</span></div>
        <antd.Table size="middle" pagination={false} rowKey="id" dataSource={topProducts}
          columns={[
            { title: "#", key: "rank", width: 50, render: (_, __, i) => <span className="num" style={{ color: "var(--ink-3)" }}>{String(i+1).padStart(2,"0")}</span> },
            { title: "SKU", dataIndex: "sku", width: 160, render: (v) => <span className="num">{v}</span> },
            { title: "Product", dataIndex: "name" },
            { title: "Revenue", dataIndex: "revenue", align: "right", width: 200, render: (v) => <span className="num" style={{ fontWeight: 600 }}><Money amount={v} currency="UZS" /></span> },
            { title: "Share", key: "share", width: 200, render: (_, r) => {
              const total = topProducts.reduce((a, p) => a + p.revenue, 0);
              const pct = (r.revenue / total) * 100;
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)" }} />
                  </div>
                  <span className="num" style={{ width: 38, textAlign: "right", fontSize: 11.5, color: "var(--ink-3)" }}>{pct.toFixed(0)}%</span>
                </div>
              );
            } },
          ]} />
      </div>
    </>
  );
};

export { AnalyticsFeature };
