import { useState } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useStockBatches } from '@/entities/inventory';
import { useCategories } from '@/entities/product';
import { StockInModal } from '@/features/stock-in';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import type { StockBatch } from '@/shared/types/domain';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';

export function PurchasesPage() {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const [creating, setCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [depletedFilter, setDepletedFilter] = useState<boolean | undefined>();

  const { data: batches = [], isLoading, isFetching, refetch } = useStockBatches();
  const { data: categories = [] } = useCategories();

  // client-side filter by category
  const filtered = categoryFilter
    ? batches.filter((b) => {
        // product doesn't carry categoryId directly — skip filter if no match
        return true;
      })
    : batches;

  const depletedFiltered =
    depletedFilter === undefined
      ? filtered
      : depletedFilter
      ? filtered.filter((b) => b.remainingQty === 0)
      : filtered.filter((b) => b.remainingQty > 0);

  // KPIs
  const totalBatches = batches.length;
  const activeBatches = batches.filter((b) => b.remainingQty > 0).length;
  const totalCost = batches.reduce((sum, b) => sum + b.initialQty * b.costPriceUzs, 0);

  const columns: ColumnDef<StockBatch>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: StockBatch, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: 'Sana',
      dataIndex: 'receivedAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: 'Mahsulot',
      key: 'product',
      render: (_: unknown, b: StockBatch) => (
        <div>
          <div style={{ fontWeight: 600 }}>{b.product.name}</div>
          {b.product.sku && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
              {b.product.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Filial',
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, b: StockBatch) => (
        <StatusBadge tone="info">{b.branch.name}</StatusBadge>
      ),
    },
    {
      title: 'Miqdor',
      key: 'qty',
      width: 160,
      align: 'right',
      render: (_: unknown, b: StockBatch) => {
        const unit = PRODUCT_UNIT_LABELS[b.product.unit];
        const depleted = b.remainingQty === 0;
        return (
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontWeight: 600 }}>
              {b.initialQty.toLocaleString('ru-RU')} {unit}
            </div>
            <div style={{ fontSize: 11.5, color: depleted ? 'var(--ink-4)' : 'var(--success)' }}>
              {depleted
                ? 'Tugagan'
                : `${b.remainingQty.toLocaleString('ru-RU')} ${unit} qoldi`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tan narxi",
      key: 'cost',
      width: 150,
      align: 'right',
      render: (_: unknown, b: StockBatch) => (
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={b.costPriceUzs} currency="UZS" />
          </div>
          {b.costPriceUsd != null && (
            <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              <MoneyDisplay amount={b.costPriceUsd} currency="USD" />
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Jami tan narxi',
      key: 'totalCost',
      width: 160,
      responsiveHide: true,
      align: 'right',
      render: (_: unknown, b: StockBatch) => (
        <span className="num" style={{ fontWeight: 600 }}>
          <MoneyDisplay amount={b.initialQty * b.costPriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Etkazuvchi izohi',
      dataIndex: 'supplierNote',
      responsiveHide: true,
      render: (v: string | null) =>
        v ? (
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: 'Kirituvchi',
      key: 'createdBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, b: StockBatch) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{b.createdBy.fullName}</span>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kirim</h1>
          <div className="sub">
            {totalBatches} ta partiya · {activeBatches} ta faol
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Yangilash">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Kirim qilish
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiBox label="Jami partiyalar" value={totalBatches} hint="barcha vaqt" />
        <KpiBox label="Faol partiyalar" value={activeBatches} hint="qoldig'i > 0" tone="success" />
        <KpiBox
          label="Jami kirim qiymati"
          value={<MoneyDisplay amount={totalCost} currency="UZS" />}
          hint="tan narxlar bo'yicha"
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Select
            value={depletedFilter === undefined ? undefined : String(depletedFilter)}
            onChange={(v) => setDepletedFilter(v === undefined ? undefined : v === 'true')}
            allowClear
            placeholder="Barcha partiyalar"
            style={{ minWidth: 180 }}
            options={[
              { value: 'false', label: 'Faol (qoldig\'i bor)' },
              { value: 'true', label: 'Tugagan' },
            ]}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{depletedFiltered.length}</strong> ta natija
          </span>
        </div>

        <DataTable<StockBatch>
          rowKey="id"
          dataSource={depletedFiltered}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} ta`, pageSizeOptions: ['10', '25', '50'] }}
          emptyText="Kirim partiyalari topilmadi"
        />
      </div>

      <StockInModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function KpiBox({
  label, value, hint, tone = 'muted',
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: 'success' | 'muted';
}) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: tone === 'success' ? 'var(--success)' : 'var(--ink-1)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
    </div>
  );
}
