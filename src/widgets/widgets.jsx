/**
 * widgets/widgets.jsx — KPI cards, charts, page composition blocks.
 */

import { useMemo } from 'react';
import dayjs from 'dayjs';
import * as Recharts from 'recharts';
import { useSel } from '../app/store.jsx';
import { fmt } from '../shared/formatters.jsx';
import { Sparkbar, Money } from '../shared/ui.jsx';

const KpiCard = ({ label, value, delta, deltaUp, hint, sparkline, accent }) => (
  <div className="kpi">
    <div className="accent" style={accent ? { background: accent } : null} />
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8, marginTop: 2 }}>
      <div>
        {delta != null && (
          <span className={`delta ${deltaUp ? "up" : "down"}`}>
            {deltaUp ? "▲" : "▼"} {delta}
          </span>
        )}
        {hint && <div style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 2 }}>{hint}</div>}
      </div>
      {sparkline && <Sparkbar values={sparkline} />}
    </div>
  </div>
);

// Build a 14-day daily series for sales / expenses for given branch (or all)
function useDailySeries(branchId) {
  const sales = useSel(s => s.sales);
  const expenses = useSel(s => s.expenses);
  const rate = useSel(s => s.settings.exchangeRate);
  const products = useSel(s => s.products);
  const productMap = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);

  return useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = dayjs().subtract(i, "day");
      days.push({
        date: d.format("MMM DD"),
        iso: d.format("YYYY-MM-DD"),
        revenue: 0, cost: 0, profit: 0, expenses: 0,
      });
    }
    const byIso = Object.fromEntries(days.map(d => [d.iso, d]));
    sales.forEach(s => {
      if (branchId && s.branchId !== branchId) return;
      const day = byIso[s.date]; if (!day) return;
      const rev = s.items.reduce((a, it) => a + fmt.toUZS(it.qty * it.price, s.currency, rate), 0);
      const cost = s.items.reduce((a, it) => {
        const p = productMap[it.productId];
        return a + fmt.toUZS(it.qty * (p?.costPrice || 0), p?.currency || "UZS", rate);
      }, 0);
      day.revenue += rev;
      day.cost += cost;
      day.profit += rev - cost;
    });
    expenses.forEach(e => {
      if (branchId && e.branchId !== branchId) return;
      const day = byIso[e.date]; if (!day) return;
      day.expenses += fmt.toUZS(e.amount, e.currency, rate);
    });
    days.forEach(d => { d.profit -= d.expenses; });
    return days;
  }, [sales, expenses, branchId, rate, productMap]);
}

const RevenueChart = ({ branchId }) => {
  const data = useDailySeries(branchId);
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } = Recharts;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e4dd8" stopOpacity={0.25}/>
            <stop offset="100%" stopColor="#1e4dd8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity={0.18}/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(15,23,42,.06)" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : `${(v/1e3).toFixed(0)}K`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={48} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e6e9ef", fontSize: 12 }}
          formatter={(v) => fmt.fmtCompactUZS(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="revenue" name="Revenue"  stroke="#1e4dd8" strokeWidth={2} fill="url(#gRev)" />
        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={2} fill="url(#gExp)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const ProfitBars = ({ branchId }) => {
  const data = useDailySeries(branchId);
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } = Recharts;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(15,23,42,.06)" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tickFormatter={(v) => {
          const a = Math.abs(v);
          if (a >= 1e9) return `${(v/1e9).toFixed(1)}B`;
          if (a >= 1e6) return `${(v/1e6).toFixed(1)}M`;
          if (a >= 1e3) return `${(v/1e3).toFixed(0)}K`;
          return v;
        }} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={56} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e6e9ef", fontSize: 12 }} formatter={(v) => fmt.fmtCompactUZS(v)} />
        <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.profit >= 0 ? "#16a34a" : "#dc2626"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const CategoryDonut = () => {
  const sales = useSel(s => s.sales);
  const products = useSel(s => s.products);
  const categories = useSel(s => s.categories);
  const rate = useSel(s => s.settings.exchangeRate);
  const data = useMemo(() => {
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    const map = {};
    sales.forEach(s => s.items.forEach(it => {
      const p = productMap[it.productId]; if (!p) return;
      const v = fmt.toUZS(it.qty * it.price, s.currency, rate);
      map[p.categoryId] = (map[p.categoryId] || 0) + v;
    }));
    return Object.entries(map).map(([cid, v]) => {
      const c = categories.find(c => c.id === cid);
      return { name: c?.name || cid, value: v, color: c?.color || "#64748b" };
    });
  }, [sales, products, categories, rate]);

  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = Recharts;
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "center" }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(v) => fmt.fmtCompactUZS(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="col" style={{ gap: 6 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
              {d.name}
            </span>
            <span className="num" style={{ color: "var(--ink-2)" }}>{((d.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { KpiCard, RevenueChart, ProfitBars, CategoryDonut, useDailySeries };
