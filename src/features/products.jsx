/**
 * features/products.jsx — product list + batch detail.
 */

import { useState, useEffect } from 'react';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { TagPill, Money, SectionTitle } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';

const ProductsFeature = () => {
  const t = useT();
  const products = useSel(s => s.products);
  const categories = useSel(s => s.categories);
  const stock = useSel(s => s.stock);
  const branches = useSel(s => s.branches);
  const lowThreshold = useSel(s => s.settings.lowStockThreshold);
  const dispatch = useDispatch();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("__all__");
  const [editing, setEditing] = useState(null);
  const [drawerProduct, setDrawerProduct] = useState(null);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const filtered = products.filter(p => {
    if (cat !== "__all__" && p.categoryId !== cat) return false;
    if (q && !(p.name + p.sku).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalStockOf = (id) => Object.values(stock).reduce((a, b) => a + (b[id] || 0), 0);

  const columns = [
    { title: "SKU", dataIndex: "sku", key: "sku", width: 140, render: (v) => <span className="num" style={{ color: "var(--ink-2)" }}>{v}</span> },
    { title: "Product", dataIndex: "name", key: "name", render: (v, p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="placeholder-img" style={{ width: 36, height: 36, fontSize: 9 }}>IMG</div>
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{catMap[p.categoryId]?.name}</div>
        </div>
      </div>
    ) },
    { title: "Unit",  dataIndex: "unit", key: "unit", width: 80, render: (v) => <TagPill>{v}</TagPill> },
    { title: "Cost",  key: "cost", width: 130, align: "right", render: (_, p) => <Money amount={p.costPrice} currency={p.currency} /> },
    { title: "Retail", key: "retail", width: 130, align: "right", render: (_, p) => <Money amount={p.retailPrice} currency={p.currency} /> },
    { title: "Wholesale", key: "wholesale", width: 130, align: "right", render: (_, p) => <Money amount={p.wholesalePrice} currency={p.currency} /> },
    { title: "Stock", key: "stock", width: 200, render: (_, p) => {
      const total = totalStockOf(p.id);
      const tone = total < lowThreshold ? "danger" : total < lowThreshold * 2 ? "warn" : "success";
      return (
        <div className="col" style={{ gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="num" style={{ fontWeight: 600 }}>{total}</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.unit}</span>
            <TagPill tone={tone}>{tone === "danger" ? "low" : tone === "warn" ? "watch" : "ok"}</TagPill>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {branches.map(b => `${b.code} ${(stock[b.id]||{})[p.id]||0}`).join(" · ")}
          </div>
        </div>
      );
    } },
    { title: "Batches", key: "batches", width: 90, render: (_, p) => <TagPill tone="info">{p.batches?.length || 0}</TagPill> },
    { title: "", key: "act", width: 80, render: (_, p) => (
      <div style={{ display: "flex", gap: 4 }}>
        <antd.Button size="small" type="text" icon={<icons.EyeOutlined />} onClick={() => setDrawerProduct(p)} />
        <antd.Button size="small" type="text" icon={<icons.EditOutlined />} onClick={() => setEditing(p)} />
      </div>
    ) },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.products")}</h1>
          <div className="sub">{products.length} SKUs across {branches.length} branches · batch-level inventory</div>
        </div>
        <antd.Button type="primary" icon={<icons.PlusOutlined />} onClick={() => setEditing({ id: `p-${Math.random().toString(36).slice(2,7)}`, sku: "", name: "", categoryId: "c-prof", unit: "piece", costPrice: 0, retailPrice: 0, wholesalePrice: 0, currency: "UZS", batches: [] })}>
          New product
        </antd.Button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <antd.Input prefix={<icons.SearchOutlined />} placeholder="Search SKU or name" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
          <antd.Select value={cat} onChange={setCat} style={{ minWidth: 200 }}
            options={[{ value: "__all__", label: "All categories" }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <div style={{ marginLeft: "auto", color: "var(--ink-3)", fontSize: 12.5 }}>
            Showing <strong>{filtered.length}</strong> of {products.length}
          </div>
        </div>
        <antd.Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={false}
          size="middle"
          onRow={(p) => ({ onClick: (e) => { if (e.target.closest("button")) return; setDrawerProduct(p); }, style: { cursor: "pointer" } })}
        />
      </div>

      {/* Edit modal */}
      <ProductFormModal product={editing} onClose={() => setEditing(null)} />

      {/* Detail drawer */}
      <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />
    </>
  );
};

const ProductFormModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const categories = useSel(s => s.categories);
  const [form] = antd.Form.useForm();

  useEffect(() => {
    if (product) form.setFieldsValue(product);
  }, [product]);

  if (!product) return null;
  const isNew = !useSel(s => s.products.some(p => p.id === product.id));

  const submit = () => {
    form.validateFields().then(vals => {
      dispatch({ type: "products/upsert", product: { ...product, ...vals } });
      antd.message.success(isNew ? "Product created" : "Product updated");
      onClose();
    });
  };

  return (
    <antd.Modal title={isNew ? "New product" : `Edit · ${product.sku}`} open={!!product} onCancel={onClose} onOk={submit} okText="Save" width={680}>
      <antd.Form form={form} layout="vertical" initialValues={product}>
        <div className="grid-2">
          <antd.Form.Item name="sku" label="SKU" rules={[{ required: true }]}><antd.Input placeholder="PRF-XYZ-001" /></antd.Form.Item>
          <antd.Form.Item name="name" label="Name" rules={[{ required: true }]}><antd.Input /></antd.Form.Item>
        </div>
        <div className="grid-2">
          <antd.Form.Item name="categoryId" label="Category">
            <antd.Select options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </antd.Form.Item>
          <antd.Form.Item name="unit" label="Unit">
            <antd.Select options={["piece","meter","kg","pack","m²"].map(u => ({ value: u, label: u }))} />
          </antd.Form.Item>
        </div>
        <div className="grid-3">
          <antd.Form.Item name="costPrice" label="Cost"><antd.InputNumber style={{ width: "100%" }} min={0} /></antd.Form.Item>
          <antd.Form.Item name="retailPrice" label="Retail"><antd.InputNumber style={{ width: "100%" }} min={0} /></antd.Form.Item>
          <antd.Form.Item name="wholesalePrice" label="Wholesale"><antd.InputNumber style={{ width: "100%" }} min={0} /></antd.Form.Item>
        </div>
        <antd.Form.Item name="currency" label="Currency">
          <antd.Radio.Group>
            <antd.Radio.Button value="UZS">UZS</antd.Radio.Button>
            <antd.Radio.Button value="USD">USD</antd.Radio.Button>
          </antd.Radio.Group>
        </antd.Form.Item>
      </antd.Form>
    </antd.Modal>
  );
};

const ProductDrawer = ({ product, onClose }) => {
  const branches = useSel(s => s.branches);
  const stock = useSel(s => s.stock);
  if (!product) return null;
  return (
    <antd.Drawer title={null} open={!!product} onClose={onClose} width={520} styles={{ body: { padding: 0 } }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>{product.sku}</div>
        <h2 style={{ margin: "6px 0 4px", fontSize: 22, letterSpacing: "-0.01em" }}>{product.name}</h2>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <TagPill tone="info">{product.unit}</TagPill>
          <TagPill>{product.currency}</TagPill>
          <TagPill tone="muted">{product.batches?.length || 0} batches</TagPill>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <SectionTitle>Pricing</SectionTitle>
        <div className="grid-3" style={{ marginBottom: 18 }}>
          <div className="kpi" style={{ minHeight: 78 }}><div className="label">Cost</div><div className="value" style={{ fontSize: 18 }}><Money amount={product.costPrice} currency={product.currency} /></div></div>
          <div className="kpi" style={{ minHeight: 78 }}><div className="label">Retail</div><div className="value" style={{ fontSize: 18 }}><Money amount={product.retailPrice} currency={product.currency} /></div></div>
          <div className="kpi" style={{ minHeight: 78 }}><div className="label">Wholesale</div><div className="value" style={{ fontSize: 18 }}><Money amount={product.wholesalePrice} currency={product.currency} /></div></div>
        </div>

        <SectionTitle>Stock by branch</SectionTitle>
        <div className="col" style={{ gap: 6, marginBottom: 18 }}>
          {branches.map(b => {
            const q = (stock[b.id] || {})[product.id] || 0;
            return (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-2)" }}>
                <span><strong>{b.code}</strong> · {b.name}</span>
                <span className="num" style={{ fontWeight: 600 }}>{q} {product.unit}</span>
              </div>
            );
          })}
        </div>

        <SectionTitle>Purchase batches</SectionTitle>
        <antd.Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={product.batches || []}
          columns={[
            { title: "Date", dataIndex: "date", render: fmt.fmtDate },
            { title: "Supplier", dataIndex: "supplier" },
            { title: "Qty", dataIndex: "qty", align: "right", render: (v) => <span className="num">{v}</span> },
            { title: "Cost / unit", dataIndex: "costPrice", align: "right", render: (v) => <Money amount={v} currency={product.currency} /> },
          ]}
        />
      </div>
    </antd.Drawer>
  );
};

export { ProductsFeature };
