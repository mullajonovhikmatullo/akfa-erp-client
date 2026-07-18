/**
 * features/sales.jsx — sales create flow + history.
 *
 * The create flow is the most complex piece of the system:
 * - multi-product line items
 * - per-line unit + custom price override
 * - retail / wholesale price mode toggle
 * - currency mix (USD lines convert into the chosen sale currency)
 * - real-time customer balance preview
 * - on submit: deduct stock, create sale, update customer balance
 */

import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { TagPill, Money, EmptyState, SectionTitle } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';

const SalesFeature = () => {
  const t = useT();
  const sales = useSel(s => s.sales);
  const customers = useSel(s => s.customers);
  const products = useSel(s => s.products);
  const branches = useSel(s => s.branches);
  const activeBranchId = useSel(sel.activeBranchId);
  const isSuper = useSel(sel.isSuper);

  const { control: tabControl } = useForm({ defaultValues: { tab: "create" } });
  const tab = useWatch({ control: tabControl, name: "tab" });
  const filtered = sales.filter(s => isSuper && activeBranchId === "__all__" ? true : s.branchId === activeBranchId);

  const customerMap = Object.fromEntries(customers.map(c => [c.id, c]));
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.sales")}</h1>
          <div className="sub">Create new sales, browse history, and reconcile customer ledgers.</div>
        </div>
        <Controller
          name="tab"
          control={tabControl}
          render={({ field }) => (
            <antd.Segmented
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "+ New sale", value: "create" },
                { label: `History (${filtered.length})`, value: "history" },
              ]}
              size="large"
            />
          )}
        />
      </div>

      {tab === "create" ? <NewSaleFlow /> : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <antd.Table
            rowKey="id"
            dataSource={filtered}
            pagination={{ pageSize: 12 }}
            columns={[
              { title: "ID", dataIndex: "id", width: 110, render: (v) => <span className="num" style={{ color: "var(--ink-2)" }}>#{v.toUpperCase()}</span> },
              { title: "Date", dataIndex: "date", width: 130, render: fmt.fmtDate },
              { title: "Customer", dataIndex: "customerId", render: (v) => customerMap[v]?.name || "—" },
              { title: "Branch", dataIndex: "branchId", width: 200, render: (v) => <TagPill tone="info">{branchMap[v]?.code}</TagPill> },
              { title: "Mode", dataIndex: "priceMode", width: 100, render: (v) => <TagPill tone={v === "wholesale" ? "info" : "muted"}>{v}</TagPill> },
              { title: "Items", dataIndex: "items", width: 80, align: "center", render: (v) => v.length },
              { title: "Total", key: "total", width: 160, align: "right", render: (_, s) => {
                const total = s.items.reduce((a, it) => a + it.qty * it.price, 0);
                return <span className="num" style={{ fontWeight: 600 }}><Money amount={total} currency={s.currency} /></span>;
              } },
              { title: "Paid", dataIndex: "paid", width: 160, align: "right", render: (v, s) => <Money amount={v} currency={s.currency} /> },
              { title: "Status", key: "status", width: 110, render: (_, s) => {
                const total = s.items.reduce((a, it) => a + it.qty * it.price, 0);
                const debt = total - s.paid;
                return debt > 0 ? <TagPill tone="danger" dot>partial</TagPill> : <TagPill tone="success" dot>paid</TagPill>;
              } },
            ]}
          />
        </div>
      )}
    </>
  );
};

const NewSaleFlow = () => {
  const dispatch = useDispatch();
  const products = useSel(s => s.products);
  const customers = useSel(s => s.customers);
  const branches = useSel(s => s.branches);
  const stock = useSel(s => s.stock);
  const rate = useSel(s => s.settings.exchangeRate);
  const activeBranchId = useSel(sel.activeBranchId);
  const isSuper = useSel(sel.isSuper);

  const defaultBranch = activeBranchId === "__all__" ? branches[0]?.id : activeBranchId;
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      branchId: defaultBranch,
      customerId: customers[0]?.id,
      priceMode: "retail",
      currency: "UZS",
      paid: 0,
      items: [],
    },
  });
  const { append, remove } = useFieldArray({
    control,
    name: "items",
    keyName: "fieldId",
  });
  const branchId = useWatch({ control, name: "branchId" });
  const customerId = useWatch({ control, name: "customerId" });
  const priceMode = useWatch({ control, name: "priceMode" }) || "retail";
  const currency = useWatch({ control, name: "currency" }) || "UZS";
  const paid = useWatch({ control, name: "paid" }) || 0;
  const items = useWatch({ control, name: "items" }) || [];
  const selectedProductIds = useMemo(() => new Set(items.map(it => it.productId)), [items]);

  const customer = customers.find(c => c.id === customerId);

  const addItem = (productId) => {
    const p = products.find(p => p.id === productId);
    if (!p) return;
    const basePrice = priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
    // convert price into sale currency
    let price = basePrice;
    if (p.currency !== currency) {
      price = p.currency === "USD" ? basePrice * rate : basePrice / rate;
      price = Math.round(price);
    }
    if (items.some(it => it.productId === productId)) return;
    append({ id: Math.random().toString(36).slice(2,7), productId, qty: 1, unit: p.unit, price });
  };

  // Re-price when mode/currency changes
  useEffect(() => {
    setValue("items", items.map(it => {
      const p = products.find(pp => pp.id === it.productId); if (!p) return it;
      const base = priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
      let price = base;
      if (p.currency !== currency) {
        price = p.currency === "USD" ? base * rate : base / rate;
        price = Math.round(price);
      }
      return { ...it, price };
    }));
  }, [priceMode, currency]);

  useEffect(() => {
    if (defaultBranch && !branchId) setValue("branchId", defaultBranch);
  }, [branchId, defaultBranch, setValue]);

  const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0);
  const debtToAdd = Math.max(0, subtotal - (paid || 0));
  const newBalance = customer ? customer.balance - debtToAdd : 0;

  const stockOf = (productId) => (stock[branchId] || {})[productId] || 0;
  const overstockItems = items.filter(it => it.qty > stockOf(it.productId));

  const submit = handleSubmit((vals) => {
    if (vals.items.length === 0) { antd.message.warning("Add at least one product"); return; }
    if (overstockItems.length) { antd.message.error("Some items exceed available stock"); return; }
    const sale = {
      id: `s-${1024 + Math.floor(Math.random() * 9000)}`,
      date: dayjs().format("YYYY-MM-DD"),
      branchId: vals.branchId,
      customerId: vals.customerId,
      priceMode: vals.priceMode,
      currency: vals.currency,
      items: vals.items.map(({ id, ...rest }) => rest),
      paid: Number(vals.paid) || 0,
    };
    dispatch({ type: "sales/create", sale });
    antd.notification.success({ message: "Sale created", description: `${vals.items.length} items · ${fmt.fmtMoney(subtotal, currency)}` });
    setValue("items", []);
    setValue("paid", 0);
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "flex-start" }}>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
          {isSuper && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Branch</div>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <antd.Select
                    value={field.value}
                    onChange={field.onChange}
                    style={{ width: "100%" }}
                    options={branches.map(b => ({ value: b.id, label: b.name }))}
                  />
                )}
              />
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Customer</div>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <antd.Select
                  showSearch
                  optionFilterProp="label"
                  value={field.value}
                  onChange={field.onChange}
                  style={{ width: "100%" }}
                  options={customers.map(c => ({ value: c.id, label: `${c.name} · ${c.phone}` }))}
                />
              )}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Price mode</div>
            <Controller
              name="priceMode"
              control={control}
              render={({ field }) => (
                <antd.Radio.Group value={field.value} onChange={e => field.onChange(e.target.value)}>
                  <antd.Radio.Button value="retail">Retail</antd.Radio.Button>
                  <antd.Radio.Button value="wholesale">Wholesale</antd.Radio.Button>
                </antd.Radio.Group>
              )}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <antd.Select
            placeholder="+ Add product to sale (search SKU or name)"
            showSearch optionFilterProp="label"
            style={{ width: "100%" }}
            value={null}
            onChange={addItem}
            options={products
              .filter(p => !selectedProductIds.has(p.id))
              .map(p => ({
                value: p.id,
                label: `${p.sku} · ${p.name} · ${stockOf(p.id)} ${p.unit} on hand`,
              }))}
            suffixIcon={<icons.PlusOutlined />}
          />
        </div>

        {items.length === 0 ? (
          <EmptyState title="No items yet" hint="Pick products from the list above to start the sale." />
        ) : (
          <div>
            <div className="sales-grid head">
              <div>Product</div><div>Qty</div><div>Unit</div><div>Price / unit</div><div>Stock</div><div>Subtotal</div><div></div>
            </div>
            {items.map((it, index) => {
              const p = products.find(pp => pp.id === it.productId);
              const onHand = stockOf(it.productId);
              const over = it.qty > onHand;
              return (
                <div key={it.id} className="sales-grid row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{p?.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="num">{p?.sku}</div>
                  </div>
                  <Controller
                    name={`items.${index}.qty`}
                    control={control}
                    render={({ field }) => <antd.InputNumber min={0.1} step={1} value={field.value} onChange={field.onChange} style={{ width: "100%" }} />}
                  />
                  <Controller
                    name={`items.${index}.unit`}
                    control={control}
                    render={({ field }) => (
                      <antd.Select
                        value={field.value}
                        onChange={field.onChange}
                        options={["PIECE","KG"].map(u => ({ value: u, label: u }))}
                        style={{ width: "100%" }}
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name={`items.${index}.price`}
                    control={control}
                    render={({ field }) => (
                      <antd.InputNumber
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={field.onChange}
                        style={{ width: "100%" }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                      />
                    )}
                  />
                  <div className={over ? "num" : "num"} style={{ color: over ? "var(--danger)" : "var(--ink-2)" }}>
                    {onHand} {p?.unit} {over && <TagPill tone="danger">over</TagPill>}
                  </div>
                  <div className="num" style={{ fontWeight: 600 }}><Money amount={it.qty * it.price} currency={currency} /></div>
                  <antd.Button type="text" icon={<icons.DeleteOutlined />} onClick={() => remove(index)} danger size="small" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary panel */}
      <div className="card" style={{ position: "sticky", top: 76 }}>
        <SectionTitle>Sale summary</SectionTitle>

        <div className="col" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--ink-3)" }}>Sale currency</span>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <antd.Radio.Group size="small" value={field.value} onChange={e => field.onChange(e.target.value)}>
                  <antd.Radio.Button value="UZS">UZS</antd.Radio.Button>
                  <antd.Radio.Button value="USD">USD</antd.Radio.Button>
                </antd.Radio.Group>
              )}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--ink-3)" }}>Items</span>
            <span className="num">{items.length} lines · {items.reduce((a,it) => a + it.qty, 0)} units</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--ink-3)" }}>Mode</span>
            <TagPill tone={priceMode === "wholesale" ? "info" : "muted"}>{priceMode}</TagPill>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--ink-3)" }}>FX rate</span>
            <span className="num">1 USD = {rate.toLocaleString("ru-RU").replace(/,/g, " ")}</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "14px 0" }} />

        <div className="col" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>Subtotal</span>
            <span className="num" style={{ fontWeight: 600 }}><Money amount={subtotal} currency={currency} /></span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>Paid now</div>
            <Controller
              name="paid"
              control={control}
              render={({ field }) => (
                <antd.InputNumber
                  value={field.value}
                  onChange={field.onChange}
                  style={{ width: "100%" }}
                  step={100000}
                  min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                />
              )}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--ink-3)" }}>Will add to customer debt</span>
            <span className="num" style={{ fontWeight: 600, color: debtToAdd > 0 ? "var(--danger)" : "var(--success)" }}>
              <Money amount={debtToAdd} currency={currency} />
            </span>
          </div>
          {customer && (
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 12.5 }}>
              <div style={{ color: "var(--ink-3)", marginBottom: 4 }}>{customer.name} balance</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ink-3)" }}>Current</span>
                <span className="num"><Money amount={customer.balance} currency="UZS" /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>After sale</span>
                <span className="num" style={{ color: newBalance < 0 ? "var(--danger)" : "var(--success)" }}>
                  <Money amount={newBalance} currency="UZS" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "14px 0" }} />

        {overstockItems.length > 0 && (
          <antd.Alert type="error" showIcon style={{ marginBottom: 10 }} message={`${overstockItems.length} item(s) over stock — adjust quantity or transfer first.`} />
        )}

        <antd.Button type="primary" size="large" block icon={<icons.CheckOutlined />} disabled={items.length === 0 || overstockItems.length > 0} onClick={submit}>
          Confirm sale
        </antd.Button>
      </div>
    </div>
  );
};

export { SalesFeature };
