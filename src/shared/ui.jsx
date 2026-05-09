/**
 * shared/ui.jsx — small reusable atoms.
 */

import { useSel } from '../app/store.jsx';
import { fmt } from './formatters.jsx';

const Brandmark = ({ withWord = true, dark = false }) => (
  <span className="brandmark" style={{ color: dark ? "#fff" : "var(--ink)" }}>
    <span className="logo" />
    {withWord && <span style={{ fontSize: 16, letterSpacing: "-0.01em" }}>AKFA <span style={{ color: dark ? "#94a3b8" : "var(--ink-3)", fontWeight: 500 }}>ERP</span></span>}
  </span>
);

const TagPill = ({ tone = "muted", children, dot }) => (
  <span className={`tagpill ${tone}`}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />}
    {children}
  </span>
);

const Money = ({ amount, currency = "UZS", compact = false }) => {
  const rate = useSel(s => s.settings.exchangeRate);
  const display = useSel(s => s.settings.displayCurrency);
  // convert to display currency
  let v = amount;
  if (currency !== display) {
    v = currency === "USD" ? amount * rate : amount / rate;
  }
  if (compact && display === "UZS") return <span className="num">{fmt.fmtCompactUZS(v)}</span>;
  return <span className="num">{display === "USD" ? fmt.fmtUSD(v) : fmt.fmtUZS(v)}</span>;
};

const Sparkbar = ({ values = [], color = "var(--primary)" }) => {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          width: 4, height: `${(v / max) * 100}%`, minHeight: 2,
          background: color, opacity: 0.35 + 0.65 * (v / max), borderRadius: 1,
        }} />
      ))}
    </div>
  );
};

const Avatar = ({ name, tone = "#1e4dd8", size = 28 }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${tone}, ${tone}cc)`,
      color: "#fff", fontSize: size * 0.42, fontWeight: 600,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{initials}</span>
  );
};

const SectionTitle = ({ children, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 12px" }}>
    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: ".06em" }}>{children}</h3>
    {action}
  </div>
);

const EmptyState = ({ title = "No data", hint }) => (
  <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--ink-3)", border: "1px dashed var(--border)", borderRadius: 10, background: "var(--surface-2)" }}>
    <div style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 4 }}>{title}</div>
    {hint && <div style={{ fontSize: 12.5 }}>{hint}</div>}
  </div>
);

export { Brandmark, TagPill, Money, Sparkbar, Avatar, SectionTitle, EmptyState };
