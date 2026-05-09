/**
 * features/transfers.jsx — inter-branch stock transfers.
 */

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { TagPill, EmptyState } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';

const TransfersFeature = () => {
  const t = useT();
  const transfers = useSel(s => s.transfers);
  const branches = useSel(s => s.branches);
  const products = useSel(s => s.products);
  const stock = useSel(s => s.stock);
  const dispatch = useDispatch();

  const [creating, setCreating] = useState(false);
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.transfers")}</h1>
          <div className="sub">Move stock between the main warehouse and branch showrooms.</div>
        </div>
        <antd.Button type="primary" icon={<icons.SwapOutlined />} onClick={() => setCreating(true)}>New transfer</antd.Button>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {branches.map(b => {
          const totalUnits = Object.values(stock[b.id] || {}).reduce((a, v) => a + v, 0);
          return (
            <div key={b.id} className="kpi" style={{ minHeight: 100 }}>
              <div className="label">{b.code} — {b.name.split(" — ")[1] || b.name}</div>
              <div className="value">{totalUnits.toLocaleString()}</div>
              <div className="delta" style={{ color: "var(--ink-3)" }}>units across {Object.keys(stock[b.id] || {}).length} SKUs</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <antd.Table
          rowKey="id"
          dataSource={transfers}
          pagination={false}
          expandable={{
            expandedRowRender: (tr) => (
              <antd.Table size="small" pagination={false} rowKey={(r,i) => i}
                dataSource={tr.items}
                columns={[
                  { title: "Product", dataIndex: "productId", render: (v) => productMap[v]?.name },
                  { title: "SKU", dataIndex: "productId", render: (v) => <span className="num">{productMap[v]?.sku}</span>, width: 140 },
                  { title: "Qty", dataIndex: "qty", align: "right", render: (v, r) => <span className="num">{v} {r.unit}</span>, width: 120 },
                ]} />
            )
          }}
          columns={[
            { title: "ID", dataIndex: "id", width: 110, render: (v) => <span className="num">#{v.toUpperCase()}</span> },
            { title: "Date", dataIndex: "date", width: 130, render: fmt.fmtDate },
            { title: "From → To", key: "route", render: (_, r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagPill tone="info">{branchMap[r.fromBranchId]?.code}</TagPill>
                <icons.ArrowRightOutlined style={{ color: "var(--ink-3)" }} />
                <TagPill tone="info">{branchMap[r.toBranchId]?.code}</TagPill>
              </div>
            ) },
            { title: "Items", dataIndex: "items", width: 80, align: "center", render: (v) => v.length },
            { title: "Status", dataIndex: "status", width: 140, render: (v) => v === "received" ? <TagPill tone="success" dot>received</TagPill> : <TagPill tone="warn" dot>in transit</TagPill> },
          ]}
        />
      </div>

      <TransferModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
};

const TransferModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const branches = useSel(s => s.branches);
  const products = useSel(s => s.products);
  const stock = useSel(s => s.stock);
  const [from, setFrom] = useState(branches[0]?.id);
  const [to, setTo] = useState(branches[1]?.id);
  const [items, setItems] = useState([]);

  useEffect(() => { if (open) { setItems([]); setFrom(branches[0]?.id); setTo(branches[1]?.id); } }, [open]);

  const stockOf = (productId) => (stock[from] || {})[productId] || 0;
  const addItem = (productId) => {
    const p = products.find(pp => pp.id === productId); if (!p) return;
    setItems(arr => [...arr, { id: Math.random().toString(36).slice(2,7), productId, qty: 1, unit: p.unit }]);
  };
  const submit = () => {
    if (from === to) return antd.message.warning("Pick different source and destination");
    if (items.length === 0) return antd.message.warning("Add at least one product");
    const transfer = {
      id: `t-${Math.floor(Math.random() * 999)}`,
      date: dayjs().format("YYYY-MM-DD"),
      fromBranchId: from, toBranchId: to,
      status: "in_transit",
      items: items.map(({ id, ...rest }) => rest),
    };
    dispatch({ type: "transfers/create", transfer });
    antd.message.success("Transfer initiated");
    onClose();
  };

  return (
    <antd.Modal open={open} onCancel={onClose} onOk={submit} title="New transfer" okText="Send" width={680}>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>From</div>
          <antd.Select value={from} onChange={setFrom} style={{ width: "100%" }} options={branches.map(b => ({ value: b.id, label: b.name }))} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>To</div>
          <antd.Select value={to} onChange={setTo} style={{ width: "100%" }} options={branches.map(b => ({ value: b.id, label: b.name }))} />
        </div>
      </div>

      <antd.Select placeholder="+ Add product" showSearch optionFilterProp="label" style={{ width: "100%", marginBottom: 12 }}
        value={null} onChange={addItem}
        options={products.map(p => ({ value: p.id, label: `${p.sku} · ${p.name} · ${stockOf(p.id)} on hand` }))} />

      {items.length === 0 ? <EmptyState title="No items" hint="Pick products to transfer." /> : (
        <antd.Table size="small" pagination={false} rowKey="id" dataSource={items}
          columns={[
            { title: "Product", dataIndex: "productId", render: (v) => products.find(p => p.id === v)?.name },
            { title: "Available", dataIndex: "productId", width: 110, render: (v) => <span className="num">{stockOf(v)}</span> },
            { title: "Qty", dataIndex: "qty", width: 110, render: (v, r) => {
              const max = stockOf(r.productId);
              return <antd.InputNumber value={v} min={1} max={max} onChange={n => setItems(arr => arr.map(it => it.id === r.id ? { ...it, qty: n } : it))} />;
            } },
            { title: "", key: "x", width: 40, render: (_, r) => <antd.Button type="text" danger icon={<icons.DeleteOutlined />} onClick={() => setItems(arr => arr.filter(it => it.id !== r.id))} /> },
          ]} />
      )}
    </antd.Modal>
  );
};

export { TransfersFeature };
