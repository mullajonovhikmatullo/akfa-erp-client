/**
 * features/purchases.jsx — purchase orders / stock intake.
 */

import { useState, useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { TagPill, Money, EmptyState } from '../shared/ui.jsx';
import { fmt } from '../shared/formatters.jsx';

const PurchasesFeature = () => {
  const t = useT();
  const purchases = useSel(s => s.purchases);
  const products = useSel(s => s.products);
  const branches = useSel(s => s.branches);
  const dispatch = useDispatch();
  const isSuper = useSel(sel.isSuper);
  const activeBranchId = useSel(sel.activeBranchId);
  const [creating, setCreating] = useState(false);

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const branchMap = Object.fromEntries(branches.map(b => [b.id, b]));
  const filtered = purchases.filter(p => isSuper && activeBranchId === "__all__" ? true : p.branchId === activeBranchId);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.purchases")}</h1>
          <div className="sub">Receive incoming stock from suppliers — each purchase creates a new batch.</div>
        </div>
        <antd.Button type="primary" icon={<icons.PlusOutlined />} onClick={() => setCreating(true)}>New purchase order</antd.Button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <antd.Table
          rowKey="id"
          dataSource={filtered}
          pagination={false}
          expandable={{
            expandedRowRender: (po) => (
              <div style={{ padding: "0 12px 8px" }}>
                <antd.Table size="small" pagination={false}
                  rowKey={(r, i) => i}
                  dataSource={po.items}
                  columns={[
                    { title: "Product", dataIndex: "productId", render: (v) => productMap[v]?.name || v },
                    { title: "SKU", dataIndex: "productId", render: (v) => <span className="num">{productMap[v]?.sku}</span>, width: 140 },
                    { title: "Qty", dataIndex: "qty", align: "right", width: 100, render: (v, r) => <span className="num">{v} {r.unit}</span> },
                    { title: "Cost / unit", dataIndex: "costPrice", align: "right", width: 160, render: (v) => <Money amount={v} currency={po.currency} /> },
                    { title: "Subtotal", key: "sub", align: "right", width: 160, render: (_, r) => <Money amount={r.qty * r.costPrice} currency={po.currency} /> },
                  ]} />
              </div>
            ),
          }}
          columns={[
            { title: "PO", dataIndex: "id", width: 120, render: (v) => <span className="num">#{v.toUpperCase()}</span> },
            { title: "Date", dataIndex: "date", width: 130, render: fmt.fmtDate },
            { title: "Supplier", dataIndex: "supplier" },
            { title: "Branch", dataIndex: "branchId", width: 200, render: (v) => <TagPill tone="info">{branchMap[v]?.code}</TagPill> },
            { title: "Items", dataIndex: "items", width: 80, align: "center", render: (v) => v.length },
            { title: "Total cost", key: "total", align: "right", width: 180, render: (_, p) => {
              const total = p.items.reduce((a, it) => a + it.qty * it.costPrice, 0);
              return <span className="num" style={{ fontWeight: 600 }}><Money amount={total} currency={p.currency} /></span>;
            } },
          ]}
        />
      </div>

      <PurchaseModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
};

const PurchaseModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const products = useSel(s => s.products);
  const branches = useSel(s => s.branches);
  const activeBranchId = useSel(sel.activeBranchId);
  const defaultBranchId = activeBranchId === "__all__" ? branches[0].id : activeBranchId;
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      branchId: defaultBranchId,
      supplier: "AKFA Plant",
      currency: "UZS",
      items: [],
    },
  });
  const { append, remove } = useFieldArray({
    control,
    name: "items",
    keyName: "fieldId",
  });
  const items = useWatch({ control, name: "items" }) || [];

  useEffect(() => {
    if (open) {
      reset({
        branchId: defaultBranchId,
        supplier: "AKFA Plant",
        currency: "UZS",
        items: [],
      });
    }
  }, [defaultBranchId, open, reset]);

  const submit = handleSubmit((vals) => {
    if (vals.items.length === 0) return antd.message.warning("Add at least one product");
    const purchase = {
      id: `po-${500 + Math.floor(Math.random() * 500)}`,
      date: dayjs().format("YYYY-MM-DD"),
      ...vals,
      items: vals.items.map(({ id, ...rest }) => rest),
    };
    dispatch({ type: "purchases/create", purchase });
    antd.message.success("Purchase recorded · stock & batches updated");
    onClose();
  });

  const addItem = (productId) => {
    const p = products.find(pp => pp.id === productId); if (!p) return;
    append({ id: Math.random().toString(36).slice(2,7), productId, qty: 1, unit: p.unit, costPrice: p.costPrice });
  };

  return (
    <antd.Modal open={open} onCancel={onClose} onOk={submit} okText="Record purchase" width={780} title="New purchase order">
      <antd.Form layout="vertical">
        <div className="grid-3">
          <antd.Form.Item label="Supplier" required>
            <Controller name="supplier" control={control} rules={{ required: true }} render={({ field }) => <antd.Input {...field} />} />
          </antd.Form.Item>
          <antd.Form.Item label="Receiving branch">
            <Controller name="branchId" control={control} render={({ field }) => <antd.Select value={field.value} onChange={field.onChange} options={branches.map(b => ({ value: b.id, label: b.name }))} />} />
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

        <antd.Select placeholder="+ Add product" showSearch optionFilterProp="label" style={{ width: "100%", marginBottom: 12 }}
          value={null} onChange={addItem}
          options={products.map(p => ({ value: p.id, label: `${p.sku} · ${p.name}` }))} />

        {items.length === 0 ? <EmptyState title="No products" hint="Add products to populate this purchase order." /> : (
          <antd.Table size="small" pagination={false} rowKey="id" dataSource={items}
            columns={[
              { title: "Product", dataIndex: "productId", render: (v) => products.find(p => p.id === v)?.name },
              { title: "Qty", dataIndex: "qty", width: 110, render: (_, __, index) => (
                <Controller name={`items.${index}.qty`} control={control} render={({ field }) => <antd.InputNumber value={field.value} min={1} onChange={field.onChange} />} />
              ) },
              { title: "Cost", dataIndex: "costPrice", width: 160, render: (_, __, index) => (
                <Controller name={`items.${index}.costPrice`} control={control} render={({ field }) => <antd.InputNumber value={field.value} min={0} step={1000} onChange={field.onChange} />} />
              ) },
              { title: "", key: "x", width: 40, render: (_, __, index) => <antd.Button type="text" icon={<icons.DeleteOutlined />} danger onClick={() => remove(index)} /> },
            ]} />
        )}
      </antd.Form>
    </antd.Modal>
  );
};

export { PurchasesFeature };
