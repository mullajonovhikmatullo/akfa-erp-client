import { Button, Tooltip } from 'antd';
import { EyeIcon } from '@phosphor-icons/react';
import { SALE_TYPE_LABELS } from '@store/store-shared/core';
import { formatDateTime } from '@store/store-shared/lib/formatters';
import type { ColumnDef } from '@store/store-shared/ui/data-table';
import { MoneyDisplay } from '@store/store-shared/ui/money-display';
import { StatusBadge } from '@store/store-shared/ui/status-badge';
import type { SaleListItem, SaleType } from '@store/store-stub';

interface SalesColumnsOptions {
  t: (key: string) => string;
  rowIndex: (index: number) => number;
  onView: (sale: SaleListItem) => void;
}

export function createSalesColumns({ t, rowIndex, onView }: SalesColumnsOptions): ColumnDef<SaleListItem>[] {
  //
  return [
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
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{formatDateTime(value)}</span>,
    },
    {
      title: t('nav.customers'),
      key: 'customer',
      render: (_: unknown, sale: SaleListItem) =>
        sale.customer ? (
          <div>
            <div style={{ fontWeight: 600 }}>{sale.customer.fullName}</div>
            {sale.customer.phone ? (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{sale.customer.phone}</div>
            ) : null}
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
      render: (_: unknown, sale: SaleListItem) => <StatusBadge tone="muted">{sale.branch.name}</StatusBadge>,
    },
    {
      title: t('sales.colType'),
      dataIndex: 'saleType',
      width: 100,
      responsiveHide: true,
      render: (value: SaleType) => <StatusBadge tone={value === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[value]}</StatusBadge>,
    },
    {
      title: t('nav.products'),
      key: 'count',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          {sale._count.items} {t('common.countSuffix')}
        </span>
      ),
    },
    {
      title: t('common.total'),
      key: 'total',
      width: 150,
      align: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num" style={{ fontWeight: 700 }}>
          <MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('sales.colPaid'),
      key: 'paid',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => (
        <span className="num">
          <MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 110,
      align: 'center',
      render: (_: unknown, sale: SaleListItem) =>
        sale.debtAmountUzs > 0 ? (
          <StatusBadge tone="danger" dot>
            {t('sales.hasDebt')}
          </StatusBadge>
        ) : (
          <StatusBadge tone="success" dot>
            {t('sales.fullyPaid')}
          </StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <Tooltip title={t('common.view')}>
          <Button
            size="small"
            type="text"
            aria-label={t('common.view')}
            icon={<EyeIcon size={18} />}
            onClick={(event) => {
              event.stopPropagation();
              onView(sale);
            }}
          />
        </Tooltip>
      ),
    },
  ];
}
