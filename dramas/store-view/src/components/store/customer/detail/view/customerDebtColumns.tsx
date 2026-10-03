import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'
import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { SaleListItem } from '@store/store-stub'
import { saleNumber } from './customerSalesColumns'

const DAY_MS = 86400000

interface CustomerDebtColumnsOptions {
  t: StoreTranslator
  rowIndex: (index: number) => number
  onPay: (sale: SaleListItem) => void
  onView: (sale: SaleListItem) => void
}

function dueStatus(t: StoreTranslator, dueDate: string | null) {
  //
  if (!dueDate) return <span className="u-text-quiet u-fs-12">{t('customerDetail.noDueDate')}</span>
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / DAY_MS)
  const badge =
    days < 0 ? <StatusBadge tone="danger" dot>{t('customerDetail.overdueDays', { days: Math.abs(days) })}</StatusBadge>
      : days === 0 ? <StatusBadge tone="warning" dot>{t('customerDetail.dueToday')}</StatusBadge>
        : <StatusBadge tone={days <= 3 ? 'warning' : 'muted'}>{t('customerDetail.dueInDays', { days })}</StatusBadge>

  return (
    <div className="u-flex u-flex-col u-gap-4">
      <span className="u-fs-12">{formatDate(dueDate)}</span>
      {badge}
    </div>
  )
}

export function createCustomerDebtColumns({ t, rowIndex, onPay, onView }: CustomerDebtColumnsOptions): ColumnDef<SaleListItem>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 48,
      render: (_: unknown, __: SaleListItem, index: number) => <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>,
    },
    {
      title: t('customerDetail.colSale'),
      key: 'sale',
      render: (_: unknown, sale: SaleListItem) => (
        <button type="button" className="customer-link-button" onClick={() => onView(sale)}>
          <span className="u-font-mono u-fs-12 u-fw-600">{saleNumber(sale.id)}</span>
          <span className="u-text-muted u-fs-11-5">{formatDate(sale.createdAt)} · {sale.branch.name}</span>
        </button>
      ),
    },
    {
      title: t('common.total'),
      key: 'total',
      width: 140,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <span className="num"><MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('sales.colPaid'),
      key: 'paid',
      width: 140,
      align: 'right',
      responsiveHide: true,
      render: (_: unknown, sale: SaleListItem) => <span className="num u-text-muted"><MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('customerDetail.colDebt'),
      key: 'debt',
      width: 150,
      align: 'right',
      render: (_: unknown, sale: SaleListItem) => <span className="num u-text-danger u-fw-700"><MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" /></span>,
    },
    {
      title: t('customerDetail.colDueDate'),
      key: 'dueDate',
      width: 160,
      render: (_: unknown, sale: SaleListItem) => dueStatus(t, sale.debtDueDate),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: unknown, sale: SaleListItem) => (
        <Button size="small" type="primary" onClick={() => onPay(sale)}>
          {t('customerDetail.payAction')}
        </Button>
      ),
    },
  ]
}
