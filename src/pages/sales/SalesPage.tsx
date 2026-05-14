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
import { usePagination } from '@/shared/lib/usePagination';

const SALE_TYPE_OPTIONS: { value: SaleType; label: string }[] = [
  { value: 'RETAIL', label: 'Чакана' },
  { value: 'WHOLESALE', label: 'Улгуржи' },
];

export function SalesPage() {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
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
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: SaleListItem, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: 'Сана',
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: 'Мижоз',
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
          <span style={{ color: 'var(--ink-4)' }}>Аноним</span>
        ),
    },
    {
      title: 'Филиал',
      key: 'branch',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, s: SaleListItem) => (
        <StatusBadge tone="muted">{s.branch.name}</StatusBadge>
      ),
    },
    {
      title: 'Тур',
      dataIndex: 'saleType',
      width: 100,
      responsiveHide: true,
      render: (v: SaleType) => (
        <StatusBadge tone={v === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[v]}</StatusBadge>
      ),
    },
    {
      title: 'Маҳсулотлар',
      key: 'count',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, s: SaleListItem) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {s._count.items} та
        </span>
      ),
    },
    {
      title: 'Жами',
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
      title: 'Тўланган',
      key: 'paid',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, s: SaleListItem) => (
        <span className="num">
          <MoneyDisplay amount={s.paidAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Ҳолат',
      key: 'status',
      width: 110,
      align: 'center',
      render: (_: unknown, s: SaleListItem) =>
        s.debtAmountUzs > 0 ? (
          <StatusBadge tone="danger" dot>Қарз бор</StatusBadge>
        ) : (
          <StatusBadge tone="success" dot>Тўлиқ</StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, s: SaleListItem) => (
        <Tooltip title="Кўриш">
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
          <h1>Сотувлар</h1>
          <div className="sub">Янги сотув яратиш ва сотув тарихи</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={tab === 'new' ? 'primary' : 'default'}
            onClick={() => setTab('new')}
          >
            + Янги сотув
          </Button>
          <Badge count={debtCount} offset={[-6, 4]}>
            <Button
              type={tab === 'history' ? 'primary' : 'default'}
              onClick={() => setTab('history')}
            >
              Тарих ({sales.length})
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
              placeholder="Барча турлар"
              style={{ minWidth: 160 }}
              options={SALE_TYPE_OPTIONS}
            />
            <Select
              value={hasDebt === undefined ? undefined : String(hasDebt)}
              onChange={(v) => setHasDebt(v === undefined ? undefined : v === 'true')}
              allowClear
              placeholder="Тўлов ҳолати"
              style={{ minWidth: 160 }}
              options={[
                { value: 'true', label: 'Қарз бор' },
                { value: 'false', label: 'Тўлиқ тўланган' },
              ]}
            />
            <Tooltip title="Янгилаш">
              <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
            </Tooltip>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
              <strong>{sales.length}</strong> та натижа
            </span>
          </div>

          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={sales}
            columns={columns}
            loading={isLoading}
            pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} ta`, pageSizeOptions: ['10', '25', '50'] }}
            onRow={(s) => ({
              onClick: () => setDrawerSale(s),
              style: { cursor: 'pointer' },
            })}
            emptyText="Сотувлар топилмади"
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
