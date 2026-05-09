/**
 * features/customers.jsx — customer ledger + balances.
 */

import { useState, useEffect } from 'react';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { Avatar, TagPill, Money, SectionTitle, EmptyState } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';
import { KpiCard } from '../widgets/widgets.jsx';

const CustomersFeature = () => {
  const t = useT();
  const customers = useSel(s => s.customers);
  const sales = useSel(s => s.sales);
  const dispatch = useDispatch();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("__all__");
  const [editing, setEditing] = useState(null);
  const [drawer, setDrawer] = useState(null);

  const totalDebt = customers.reduce((a, c) => a + (c.balance < 0 ? -c.balance : 0), 0);
  const totalCredit = customers.reduce((a, c) => a + (c.balance > 0 ? c.balance : 0), 0);

  const filtered = customers.filter(c => {
    if (q && !(c.name + c.phone).toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "debtors" && c.balance >= 0) return false;
    if (filter === "creditors" && c.balance <= 0) return false;
    if (filter === "wholesale" && c.type !== "wholesale") return false;
    if (filter === "retail" && c.type !== "retail") return false;
    return true;
  });

  const lastTxnFor = (cid) => sales.find(s => s.customerId === cid)?.date;

  const columns = [
    { title: "Customer", dataIndex: "name", render: (v, c) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={v} tone={c.balance < 0 ? "#dc2626" : c.balance > 0 ? "#16a34a" : "#475569"} />
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{c.address}</div>
        </div>
      </div>
    ) },
    { title: "Phone", dataIndex: "phone", width: 170, render: (v) => <span className="num">{v}</span> },
    { title: "Type",  dataIndex: "type", width: 110, render: (v) => <TagPill tone={v === "wholesale" ? "info" : "muted"}>{v}</TagPill> },
    { title: "Balance", key: "balance", width: 200, align: "right", render: (_, c) => (
      <div className="col" style={{ alignItems: "flex-end", gap: 2 }}>
        <span className="num" style={{ fontWeight: 700, color: c.balance < 0 ? "var(--danger)" : c.balance > 0 ? "var(--success)" : "var(--ink-3)" }}>
          <Money amount={c.balance} currency="UZS" />
        </span>
        <TagPill tone={c.balance < 0 ? "danger" : c.balance > 0 ? "success" : "muted"}>
          {c.balance < 0 ? "owes us" : c.balance > 0 ? "has credit" : "settled"}
        </TagPill>
      </div>
    ) },
    { title: "Last txn", key: "last", width: 120, render: (_, c) => fmt.fmtDate(lastTxnFor(c.id)) || "—" },
    { title: "", key: "act", width: 80, render: (_, c) => (
      <div style={{ display: "flex", gap: 4 }}>
        <antd.Button size="small" type="text" icon={<icons.EyeOutlined />} onClick={() => setDrawer(c)} />
        <antd.Button size="small" type="text" icon={<icons.EditOutlined />} onClick={() => setEditing(c)} />
      </div>
    ) },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.customers")}</h1>
          <div className="sub">Track balances, ledger entries, and payment history.</div>
        </div>
        <antd.Button type="primary" icon={<icons.PlusOutlined />} onClick={() => setEditing({ id: `cu-${Math.random().toString(36).slice(2,6)}`, name: "", phone: "", address: "", balance: 0, type: "retail" })}>New customer</antd.Button>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <KpiCard label="Total debtors" value={<Money amount={-totalDebt} currency="UZS" />} hint={`${customers.filter(c => c.balance < 0).length} accounts`} />
        <KpiCard label="Total credits" value={<Money amount={totalCredit} currency="UZS" />} hint={`${customers.filter(c => c.balance > 0).length} accounts`} />
        <KpiCard label="Net A/R" value={<Money amount={-totalDebt + totalCredit} currency="UZS" />} hint="Receivables minus credits" />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <antd.Input prefix={<icons.SearchOutlined />} placeholder="Search name or phone" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
          <antd.Segmented value={filter} onChange={setFilter} options={[
            { label: "All", value: "__all__" },
            { label: "Debtors", value: "debtors" },
            { label: "Credits", value: "creditors" },
            { label: "Wholesale", value: "wholesale" },
            { label: "Retail", value: "retail" },
          ]} />
        </div>
        <antd.Table rowKey="id" dataSource={filtered} columns={columns} pagination={false}
          onRow={(c) => ({ onClick: (e) => { if (e.target.closest("button")) return; setDrawer(c); }, style: { cursor: "pointer" } })} />
      </div>

      <CustomerFormModal customer={editing} onClose={() => setEditing(null)} />
      <CustomerLedgerDrawer customer={drawer} onClose={() => setDrawer(null)} />
    </>
  );
};

const CustomerFormModal = ({ customer, onClose }) => {
  const dispatch = useDispatch();
  const [form] = antd.Form.useForm();
  useEffect(() => { if (customer) form.setFieldsValue(customer); }, [customer]);
  if (!customer) return null;

  const submit = () => {
    form.validateFields().then(vals => {
      dispatch({ type: "customers/upsert", customer: { ...customer, ...vals } });
      antd.message.success("Customer saved");
      onClose();
    });
  };

  return (
    <antd.Modal title="Customer" open={!!customer} onCancel={onClose} onOk={submit} okText="Save">
      <antd.Form form={form} layout="vertical">
        <antd.Form.Item name="name" label="Name" rules={[{ required: true }]}><antd.Input /></antd.Form.Item>
        <div className="grid-2">
          <antd.Form.Item name="phone" label="Phone"><antd.Input /></antd.Form.Item>
          <antd.Form.Item name="type" label="Type">
            <antd.Radio.Group>
              <antd.Radio.Button value="retail">Retail</antd.Radio.Button>
              <antd.Radio.Button value="wholesale">Wholesale</antd.Radio.Button>
            </antd.Radio.Group>
          </antd.Form.Item>
        </div>
        <antd.Form.Item name="address" label="Address"><antd.Input /></antd.Form.Item>
        <antd.Form.Item name="balance" label="Opening balance (UZS) — negative = debt">
          <antd.InputNumber style={{ width: "100%" }} step={100000} />
        </antd.Form.Item>
      </antd.Form>
    </antd.Modal>
  );
};

const CustomerLedgerDrawer = ({ customer, onClose }) => {
  const sales = useSel(s => s.sales);
  if (!customer) return null;
  const myTxns = sales.filter(s => s.customerId === customer.id);
  const totalSpent = myTxns.reduce((a, s) => a + s.items.reduce((b, it) => b + it.qty * it.price, 0), 0);

  return (
    <antd.Drawer open={!!customer} onClose={onClose} width={560} title={null} styles={{ body: { padding: 0 } }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={customer.name} size={48} tone={customer.balance < 0 ? "#dc2626" : "#16a34a"} />
          <div>
            <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>{customer.name}</h2>
            <div style={{ color: "var(--ink-3)", fontSize: 13 }}>{customer.phone} · {customer.address}</div>
          </div>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="kpi" style={{ minHeight: 78 }}>
            <div className="label">Balance</div>
            <div className="value" style={{ fontSize: 18, color: customer.balance < 0 ? "var(--danger)" : "var(--success)" }}>
              <Money amount={customer.balance} currency="UZS" />
            </div>
          </div>
          <div className="kpi" style={{ minHeight: 78 }}><div className="label">Lifetime</div><div className="value" style={{ fontSize: 18 }}><Money amount={totalSpent} currency="UZS" compact /></div></div>
          <div className="kpi" style={{ minHeight: 78 }}><div className="label">Orders</div><div className="value" style={{ fontSize: 18 }}>{myTxns.length}</div></div>
        </div>
      </div>

      <div style={{ padding: "16px 24px" }}>
        <SectionTitle>Recent transactions</SectionTitle>
        {myTxns.length === 0 ? <EmptyState title="No transactions" hint="No sales recorded for this customer yet." /> : (
          <div className="col" style={{ gap: 8 }}>
            {myTxns.map(s => {
              const total = s.items.reduce((a, it) => a + it.qty * it.price, 0);
              return (
                <div key={s.id} style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>#{s.id.toUpperCase()}</strong> · <span style={{ color: "var(--ink-3)" }}>{fmt.fmtDate(s.date)}</span>
                    </div>
                    <Money amount={total} currency={s.currency} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                    {s.items.length} line items · paid <Money amount={s.paid} currency={s.currency} /> · {s.priceMode}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </antd.Drawer>
  );
};

export { CustomersFeature };
