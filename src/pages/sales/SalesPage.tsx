import { useState } from 'react';
import { Button, Select, Tooltip, Badge } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useSales } from '@/entities/sale';
import { NewSaleForm } from '@/features/create-sale';
import { SaleDetailDrawer } from '@/widgets/sale-detail';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import type { SaleListItem, SaleType } from '@/shared/types/domain';
import { SALE_TYPE_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';

const SALE_TYPE_OPTIONS: { value: SaleType; label: string }[] = [
  { value: 'RETAIL', label: 'Chakana' },
  { value: 'WHOLESALE', label: 'Ulgurji' },
];

export function SalesPage() {
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [drawerSale, setDrawerSale] = useState<SaleListItem | null>(null);
  const [saleTypeFilter, setSaleTypeFilter] = useState<SaleType | undefined>();
  const [hasDebt, setHasDebt] = useState<boolean | undefined>();

  const { data: sales = [], isLoading, isFetching, refetch } = useSales({
    saleType: saleTypeFilter,
    hasDebt,
    limit: 100,
  });

  const columns: ColumnDef<SaleListItem>[] = [
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: 'Mijoz',
      key: 'customer',
      render: (_: unknown, s: SaleListItem) =>
        s.customer ? (
          <div>
            <div style={{ fontWeight: 600 }}>{s.customer.fullName}</div>
            {s.customer.phone && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                {s.customer.phone}
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>Anonim</span>
        ),
    },
    {
      title: 'Filial',
      key: 'branch',
      width: 140,
      render: (_: unknown, s: SaleListItem) => (
        <StatusBadge tone="muted">{s.branch.name}</StatusBadge>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'saleType',
      width: 100,
      render: (v: SaleType) => (
        <StatusBadge tone={v === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[v]}</StatusBadge>
      ),
    },
    {
      title: 'Mahsulotlar',
      key: 'count',
      width: 90,
      align: 'center',
      render: (_: unknown, s: SaleListItem) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {s._count.items} ta
        </span>
      ),
    },
    {
      title: 'Jami',
      key: 'total',
      width: 150,
      align: 'right',
      render: (_: unknown, s: SaleListItem) => (
        <span className="num" style={{ fontWeight: 700 }}>
          <MoneyDisplay amount={s.totalAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: "To'langan",
      key: 'paid',
      width: 150,
      align: 'right',
      render: (_: unknown, s: SaleListItem) => (
        <span className="num">
          <MoneyDisplay amount={s.paidAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Holat',
      key: 'status',
      width: 110,
      align: 'center',
      render: (_: unknown, s: SaleListItem) =>
        s.debtAmountUzs > 0 ? (
          <StatusBadge tone="danger" dot>Qarz bor</StatusBadge>
        ) : (
          <StatusBadge tone="success" dot>{"To'liq"}</StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, s: SaleListItem) => (
        <Tooltip title="Ko'rish">
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => { e.stopPropagation(); setDrawerSale(s); }}
          />
        </Tooltip>
      ),
    },
  ];

  const debtCount = sales.filter((s) => s.debtAmountUzs > 0).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sotuvlar</h1>
          <div className="sub">Yangi sotuv yaratish va sotuv tarixi</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={tab === 'new' ? 'primary' : 'default'}
            onClick={() => setTab('new')}
          >
            + Yangi sotuv
          </Button>
          <Badge count={debtCount} offset={[-6, 4]}>
            <Button
              type={tab === 'history' ? 'primary' : 'default'}
              onClick={() => setTab('history')}
            >
              Tarix ({sales.length})
            </Button>
          </Badge>
        </div>
      </div>

      {tab === 'new' ? (
        <NewSaleForm onSuccess={() => setTab('history')} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              value={saleTypeFilter}
              onChange={setSaleTypeFilter}
              allowClear
              placeholder="Barcha turlar"
              style={{ minWidth: 160 }}
              options={SALE_TYPE_OPTIONS}
            />
            <Select
              value={hasDebt === undefined ? undefined : String(hasDebt)}
              onChange={(v) => setHasDebt(v === undefined ? undefined : v === 'true')}
              allowClear
              placeholder="To'lov holati"
              style={{ minWidth: 160 }}
              options={[
                { value: 'true', label: 'Qarz bor' },
                { value: 'false', label: "To'liq to'langan" },
              ]}
            />
            <Tooltip title="Yangilash">
              <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
            </Tooltip>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
              <strong>{sales.length}</strong> ta natija
            </span>
          </div>

          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={sales}
            columns={columns}
            loading={isLoading}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} ta` }}
            onRow={(s) => ({
              onClick: () => setDrawerSale(s),
              style: { cursor: 'pointer' },
            })}
            emptyText="Sotuvlar topilmadi"
          />
        </div>
      )}

      <SaleDetailDrawer
        sale={drawerSale}
        onClose={() => setDrawerSale(null)}
      />
    </>
  );
}
