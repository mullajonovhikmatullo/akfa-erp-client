import { useState } from 'react';
import { Button, Select, Tooltip, Badge } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useSalesPage } from '@/entities/sale';
import { NewSaleForm } from '@/features/create-sale';
import { SaleDetailDrawer } from '@/widgets/sale-detail';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import type { SaleListItem, SaleType } from '@/shared/types/domain';
import { SALE_TYPE_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

export function SalesPage() {
  const t = useT();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [drawerSale, setDrawerSale] = useState<SaleListItem | null>(null);
  const [saleTypeFilter, setSaleTypeFilter] = useState<SaleType | undefined>();
  const [hasDebt, setHasDebt] = useState<boolean | undefined>();

  const { data: result, isLoading, isFetching, refetch } = useSalesPage(page, pageSize, {
    saleType: saleTypeFilter,
    hasDebt,
  });
  const sales = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalWithDebt = result?.totalWithDebt ?? 0;

  const SALE_TYPE_OPTIONS: { value: SaleType; label: string }[] = [
    { value: 'RETAIL', label: t('sales.typeRetail') },
    { value: 'WHOLESALE', label: t('sales.typeWholesale') },
  ];

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
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: t('nav.customers'),
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
          <span style={{ color: 'var(--ink-4)' }}>{t('sales.anonymous')}</span>
        ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, s: SaleListItem) => (
        <StatusBadge tone="muted">{s.branch.name}</StatusBadge>
      ),
    },
    {
      title: t('sales.colType'),
      dataIndex: 'saleType',
      width: 100,
      responsiveHide: true,
      render: (v: SaleType) => (
        <StatusBadge tone={v === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[v]}</StatusBadge>
      ),
    },
    {
      title: t('nav.products'),
      key: 'count',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, s: SaleListItem) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {s._count.items} {t('common.countSuffix')}
        </span>
      ),
    },
    {
      title: t('common.total'),
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
      title: t('sales.colPaid'),
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
      title: t('common.status'),
      key: 'status',
      width: 110,
      align: 'center',
      render: (_: unknown, s: SaleListItem) =>
        s.debtAmountUzs > 0 ? (
          <StatusBadge tone="danger" dot>{t('sales.hasDebt')}</StatusBadge>
        ) : (
          <StatusBadge tone="success" dot>{t('sales.fullyPaid')}</StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, s: SaleListItem) => (
        <Tooltip title={t('common.view')}>
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

  const debtCount = totalWithDebt;

  function handleSaleTypeChange(v: SaleType | undefined) {
    setSaleTypeFilter(v);
    onPageChange(1, pageSize);
  }

  function handleHasDebtChange(v: string | undefined) {
    setHasDebt(v === undefined ? undefined : v === 'true');
    onPageChange(1, pageSize);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.sales')}</h1>
          <div className="sub">{t('sales.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type={tab === 'new' ? 'primary' : 'default'}
            onClick={() => setTab('new')}
          >
            + {t('dashboard.newSale')}
          </Button>
          <Badge count={debtCount} offset={[-6, 4]}>
            <Button
              type={tab === 'history' ? 'primary' : 'default'}
              onClick={() => setTab('history')}
            >
              {t('sales.historyBtn')} ({total})
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
              onChange={handleSaleTypeChange}
              allowClear
              placeholder={t('sales.filterAllTypes')}
              style={{ minWidth: 160 }}
              options={SALE_TYPE_OPTIONS}
            />
            <Select
              value={hasDebt === undefined ? undefined : String(hasDebt)}
              onChange={handleHasDebtChange}
              allowClear
              placeholder={t('sales.filterPayment')}
              style={{ minWidth: 160 }}
              options={[
                { value: 'true', label: t('sales.hasDebt') },
                { value: 'false', label: t('sales.filterPaid') },
              ]}
            />
            <Tooltip title={t('common.refresh')}>
              <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
            </Tooltip>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
              <strong>{total}</strong> {t('common.resultsSuffix')}
            </span>
          </div>

          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={sales}
            columns={columns}
            loading={isLoading}
            pagination={{ current: page, pageSize, total, onChange: onPageChange, showSizeChanger: true, showTotal: (n) => `${n} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
            onRow={(s) => ({
              onClick: () => setDrawerSale(s),
              style: { cursor: 'pointer' },
            })}
            emptyText={t('sales.empty')}
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
