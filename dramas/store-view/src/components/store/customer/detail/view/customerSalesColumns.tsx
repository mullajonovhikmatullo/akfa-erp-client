import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button, Tooltip } from 'antd'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { SaleListItem, SaleType } from '@store/store-stub'

interface CustomerSalesColumnsOptions {
  t: StoreTranslator
  rowIndex: (index: number) => number
  onView: (sale: SaleListItem) => void
}

export function saleNumber(id: string) {
  //
  return `#${(id.split('-')[0] ?? '').toUpperCase()}`
}

export function createCustomerSalesColumns({ t, rowIndex, onView }: CustomerSalesColumnsOptions): ColumnDef<SaleListItem>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 48,
      render: (_: unknown, __: SaleListItem, index: number) => <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>,
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => <span className="u-text-muted u-fs-12 u-whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: t('customerDetail.colSale'),
      key: 'sale',
      render: (_: unknown, sale: SaleListItem) => (
        <div>
          <div className="u-font-mono u-fs-12 u-fw-600">{saleNumber(sale.id)}</div>
          <div className="u-text-muted u-fs-11-5">{sale.soldBy.fullName}</div>
        </div>
      ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <StatusBadge tone="muted">{sale.branch.name}</StatusBadge>,
    },
    {
      title: t('sales.colType'),
      dataIndex: 'saleType',
      width: 100,
      responsiveHide: true,
      render: (value: SaleType) => (
        <StatusBadge tone={value === 'RETAIL' ? 'muted' : 'info'}>{t(value === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')}</StatusBadge>
      ),
    },
    {
      title: t('nav.products'),
      key: 'count',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <span className="num u-text-muted u-fs-13">{sale._count.items} {t('common.countSuffix')}</span>,
    },
    {
      title: t('common.total'),
      key: 'total',
      width: 150,
      align: 'right',
      render: (_: unknown, sale: SaleListItem) => <span className="num u-fw-700"><MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('sales.colPaid'),
      key: 'paid',
      width: 150,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <span className="num"><MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 150,
      align: 'right',
      render: (_: unknown, sale: SaleListItem) =>
        sale.debtAmountUzs > 0 ? (
          <span className="num u-text-danger u-fw-600"><MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" /></span>
        ) : (
          <StatusBadge tone="success" dot>{t('sales.fullyPaid')}</StatusBadge>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      fixed: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <Tooltip title={t('common.view')}>
          <Button
            size="small"
            type="text"
            aria-label={t('common.view')}
            icon={<StoreIcon name="eye" size={16} />}
            onClick={(event) => {
              //
              event.stopPropagation()
              onView(sale)
            }}
          />
        </Tooltip>
      ),
    },
  ]
}
