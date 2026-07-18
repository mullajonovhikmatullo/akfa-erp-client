/**
 * features/expenses.jsx — operational expenses + custom-category management.
 *
 * Categories are stored in state.expenseCategories. Built-in categories ship
 * with the seed; admins can add, edit, recolour, and delete custom ones.
 * Removing a category reassigns its expenses to "other" so the ledger stays whole.
 */

import { useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import * as antd from 'antd';
import {
  GearIcon,
  PencilSimpleIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useSel, useDispatch, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { TagPill, Money, SectionTitle } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';

const PRESET_COLORS = [
  "#1e4dd8", "#0e7490", "#7c3aed", "#b45309",
  "#dc2626", "#16a34a", "#d97706", "#475569",
  "#db2777", "#0891b2", "#65a30d", "#9333ea",
];

const ExpensesFeature = () => {
  const t = useT();
  const expenses = useSel(s => s.expenses);
  const categories = useSel(s => s.expenseCategories || []);
  const branches = useSel(s => s.branches);
  const isSuper = useSel(sel.isSuper);
  const activeBranchId = useSel(sel.activeBranchId);
  const dispatch = useDispatch();
  const [creating, setCreating] = useState(false);
  const [managingCats, setManagingCats] = useState(false);

  const branchMap = Object.fromEntries(branches.map(b => [b.id, b]));
  const filtered = expenses.filter(e => isSuper && activeBranchId === "__all__" ? true : e.branchId === activeBranchId);

  const byCat = categories.map(c => {
    const total = filtered.filter(e => e.category === c.id).reduce((a, e) => a + e.amount, 0);
    return { ...c, total };
  });
  const grandTotal = byCat.reduce((a, b) => a + b.total, 0);
  // Top 4 by spend so the KPI strip stays useful
  const topCats = [...byCat].sort((a, b) => b.total - a.total).slice(0, 4);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.expenses")}</h1>
          <div className="sub">Recurring & ad-hoc operational costs · {categories.length} categories ({categories.filter(c => !c.builtin).length} custom)</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <antd.Button icon={<TagIcon size={18} />} onClick={() => setManagingCats(true)}>Manage categories</antd.Button>
          <antd.Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={() => setCreating(true)}>Log expense</antd.Button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {topCats.map(c => (
          <div key={c.id} className="kpi">
            <div className="accent" style={{ background: `radial-gradient(circle at 30% 30%, ${c.color}30, transparent 70%)` }} />
            <div className="label">
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: c.color, marginRight: 6, verticalAlign: "middle" }} />
              {c.label}
              {!c.builtin && <TagPill tone="info" style={{ marginLeft: 6 }}>custom</TagPill>}
            </div>
            <div className="value" style={{ fontSize: 20 }}><Money amount={c.total} currency="UZS" compact /></div>
            <div className="delta" style={{ color: "var(--ink-3)" }}>
              {grandTotal > 0 ? `${((c.total / grandTotal) * 100).toFixed(1)}% of total` : "—"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <antd.Table
            rowKey="id"
            dataSource={filtered}
            pagination={{ pageSize: 12 }}
            columns={[
              { title: "Date", dataIndex: "date", width: 130, render: fmt.fmtDate },
              { title: "Category", dataIndex: "category", width: 180, render: (v) => {
                const c = categories.find(x => x.id === v);
                if (!c) return <TagPill tone="muted">{v}</TagPill>;
                return (
                  <TagPill>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: "inline-block", marginRight: 4 }} />
                    {c.label}
                    {!c.builtin && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 10 }}>★</span>}
                  </TagPill>
                );
              } },
              { title: "Branch", dataIndex: "branchId", width: 160, render: (v) => <TagPill tone="info">{branchMap[v]?.code}</TagPill> },
              { title: "Amount", dataIndex: "amount", align: "right", width: 180, render: (v, e) => <span className="num" style={{ fontWeight: 600 }}><Money amount={v} currency={e.currency} /></span> },
              { title: "Comment", dataIndex: "comment" },
              { title: "", key: "x", width: 50, render: (_, e) => <antd.Button size="small" type="text" icon={<TrashIcon size={18} />} danger onClick={() => dispatch({ type: "expenses/remove", id: e.id })} /> },
            ]}
          />
        </div>

        <div className="card">
          <SectionTitle action={
            <antd.Button size="small" type="text" icon={<GearIcon size={16} />} onClick={() => setManagingCats(true)}>Manage</antd.Button>
          }>Breakdown</SectionTitle>
          <div className="col" style={{ gap: 10 }}>
            {byCat.map(c => {
              const pct = grandTotal ? (c.total / grandTotal) * 100 : 0;
              return (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: "inline-block" }} />
                      {c.label}
                      {!c.builtin && <span style={{ fontSize: 10, color: "var(--ink-4)" }}>custom</span>}
                    </span>
                    <span className="num" style={{ color: "var(--ink-3)" }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", margin: "14px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>Total</span>
            <span className="num" style={{ fontWeight: 700 }}><Money amount={grandTotal} currency="UZS" /></span>
          </div>
        </div>
      </div>

      <ExpenseModal open={creating} onClose={() => setCreating(false)} />
      <CategoryManagerDrawer open={managingCats} onClose={() => setManagingCats(false)} />
    </>
  );
};

const ExpenseModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const branches = useSel(s => s.branches);
  const categories = useSel(s => s.expenseCategories || []);
  const activeBranchId = useSel(sel.activeBranchId);
  const defaultBranchId = activeBranchId === "__all__" ? branches[0]?.id : activeBranchId;
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      branchId: defaultBranchId,
      currency: "UZS",
      category: "utilities",
      amount: 0,
      comment: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        branchId: defaultBranchId,
        currency: "UZS",
        category: "utilities",
        amount: 0,
        comment: "",
      });
    }
  }, [defaultBranchId, open, reset]);

  const submit = handleSubmit((vals) => {
    const expense = {
      id: `e-${Math.floor(Math.random() * 9999)}`,
      date: dayjs().format("YYYY-MM-DD"),
      ...vals,
    };
    dispatch({ type: "expenses/create", expense });
    antd.message.success("Expense recorded");
    onClose();
  });

  const renderOption = (c) => ({
    value: c.id,
    label: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
        <span>{c.label}</span>
        {!c.builtin && <span style={{ fontSize: 10, color: "var(--ink-4)", marginLeft: "auto" }}>custom</span>}
      </span>
    ),
  });

  const builtinOpts = categories.filter(c => c.builtin).map(renderOption);
  const customOpts = categories.filter(c => !c.builtin).map(renderOption);

  return (
    <antd.Modal open={open} onCancel={onClose} onOk={submit} title="Log expense" okText="Save">
      <antd.Form layout="vertical">
        <div className="grid-2">
          <antd.Form.Item label="Category" required validateStatus={errors.category ? "error" : undefined}>
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <antd.Select
                  showSearch
                  optionFilterProp="value"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: "Standard", options: builtinOpts },
                    ...(customOpts.length ? [{ label: "Custom", options: customOpts }] : []),
                  ]}
                />
              )}
            />
          </antd.Form.Item>
          <antd.Form.Item label="Branch">
            <Controller name="branchId" control={control} render={({ field }) => <antd.Select value={field.value} onChange={field.onChange} options={branches.map(b => ({ value: b.id, label: b.name }))} />} />
          </antd.Form.Item>
        </div>
        <div className="grid-2">
          <antd.Form.Item label="Amount" required validateStatus={errors.amount ? "error" : undefined}>
            <Controller
              name="amount"
              control={control}
              rules={{ required: true }}
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
          </antd.Form.Item>
          <antd.Form.Item label="Currency">
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <antd.Radio.Group value={field.value} onChange={e => field.onChange(e.target.value)}>
                  <antd.Radio.Button value="UZS">UZS</antd.Radio.Button>
                  <antd.Radio.Button value="USD">USD</antd.Radio.Button>
                </antd.Radio.Group>
              )}
            />
          </antd.Form.Item>
        </div>
        <antd.Form.Item label="Comment">
          <Controller name="comment" control={control} render={({ field }) => <antd.Input.TextArea {...field} rows={2} />} />
        </antd.Form.Item>
      </antd.Form>
    </antd.Modal>
  );
};

// ----- Category manager (drawer with inline create/edit/delete) -----
const CategoryManagerDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const categories = useSel(s => s.expenseCategories || []);
  const expenses = useSel(s => s.expenses);
  const [editing, setEditing] = useState(null); // { id?, label, color }
  const {
    control,
    handleSubmit,
    reset: resetCategoryForm,
    setValue,
  } = useForm({
    defaultValues: {
      label: "",
      color: PRESET_COLORS[0],
    },
  });
  const categoryColor = useWatch({ control, name: "color" }) || PRESET_COLORS[0];

  const usageOf = (catId) => expenses.filter(e => e.category === catId).length;

  const openNew = () => {
    setEditing({ id: "", builtin: false });
    resetCategoryForm({
      label: "",
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
    });
  };
  const openEdit = (cat) => {
    setEditing({ id: cat.id, builtin: cat.builtin });
    resetCategoryForm({ label: cat.label, color: cat.color });
  };

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const save = handleSubmit(({ label, color }) => {
    if (!label?.trim()) { antd.message.warning("Name is required"); return; }
    const isNew = !editing.id || !categories.some(c => c.id === editing.id);
    let id = editing.id;
    if (isNew) {
      id = slugify(label) || `cat_${Math.random().toString(36).slice(2,6)}`;
      // ensure uniqueness
      let base = id, i = 2;
      while (categories.some(c => c.id === id)) { id = `${base}_${i++}`; }
    }
    dispatch({
      type: "expenseCategories/upsert",
      category: { id, label: label.trim(), color, builtin: editing.builtin || false },
    });
    antd.message.success(isNew ? "Category created" : "Category updated");
    setEditing(null);
  });

  const remove = (cat) => {
    const usage = usageOf(cat.id);
    antd.Modal.confirm({
      title: `Delete "${cat.label}"?`,
      content: usage > 0
        ? `${usage} expense${usage > 1 ? "s" : ""} will be reassigned to "Other". This can't be undone.`
        : "This category has no expenses logged against it.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch({ type: "expenseCategories/remove", id: cat.id });
        antd.message.success("Category deleted");
      },
    });
  };

  return (
    <antd.Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={null}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>Settings</div>
        <h2 style={{ margin: "6px 0 4px", fontSize: 20, letterSpacing: "-0.01em" }}>Expense categories</h2>
        <div style={{ color: "var(--ink-3)", fontSize: 13 }}>
          Define your own categories so the ledger and reports match how your team actually thinks about spend.
        </div>
      </div>

      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            {categories.length} total · {categories.filter(c => !c.builtin).length} custom
          </div>
          <antd.Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={openNew}>New category</antd.Button>
        </div>

        {editing && (
          <div style={{ border: "1px solid var(--primary)", background: "#f6f8ff", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>
              {editing.id && categories.some(c => c.id === editing.id) ? "Edit category" : "New category"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>Name</div>
                <Controller
                  name="label"
                  control={control}
                  render={({ field }) => <antd.Input {...field} placeholder="e.g. Equipment maintenance" autoFocus />}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Colour</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue("color", c, { shouldDirty: true })}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: c,
                        border: categoryColor === c ? "2px solid var(--ink)" : "2px solid transparent",
                        boxShadow: categoryColor === c ? "0 0 0 2px #fff inset" : "none",
                        cursor: "pointer", padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <antd.Button onClick={() => setEditing(null)}>Cancel</antd.Button>
              <antd.Button type="primary" onClick={save}>Save</antd.Button>
            </div>
          </div>
        )}

        <div className="col" style={{ gap: 8 }}>
          {categories.map(cat => {
            const usage = usageOf(cat.id);
            return (
              <div key={cat.id} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center",
                padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)",
              }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: cat.color, display: "inline-block" }} />
                <div>
                  <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    {cat.label}
                    {cat.builtin
                      ? <TagPill tone="muted">built-in</TagPill>
                      : <TagPill tone="info">custom</TagPill>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }} className="num">
                    id: {cat.id} · {usage} expense{usage === 1 ? "" : "s"}
                  </div>
                </div>
                <antd.Button size="small" type="text" icon={<PencilSimpleIcon size={16} />} onClick={() => openEdit(cat)} />
                <antd.Button
                  size="small"
                  type="text"
                  danger
                  icon={<TrashIcon size={16} />}
                  disabled={cat.id === "other"}
                  onClick={() => remove(cat)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </antd.Drawer>
  );
};

export { ExpensesFeature };
