import type { StoreTranslator } from '@store/store-i18n'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { DebtPayment, PaymentMethod } from '@store/store-stub'
import { saleNumber } from './customerSalesColumns'

interface CustomerPaymentColumnsOptions {
  t: StoreTranslator
  rowIndex: (index: number) => number
}

export function createCustomerPaymentColumns({ t, rowIndex }: CustomerPaymentColumnsOptions): ColumnDef<DebtPayment>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 48,
      render: (_: unknown, __: DebtPayment, index: number) => <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>,
    },
    {
      title: t('common.date'),
      dataIndex: 'createdAt',
      width: 140,
      render: (value: string) => <span className="u-text-muted u-fs-12 u-whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: t('customerDetail.colSale'),
      key: 'sale',
      render: (_: unknown, payment: DebtPayment) => (
        <div>
          <div className="u-font-mono u-fs-12 u-fw-600">{saleNumber(payment.sale.id)}</div>
          <StatusBadge tone="muted">{payment.sale.branch.name}</StatusBadge>
        </div>
      ),
    },
    {
      title: t('customers.paymentsAmount'),
      key: 'amount',
      width: 160,
      align: 'right',
      render: (_: unknown, payment: DebtPayment) => (
        <strong className="num u-text-success"><MoneyDisplay amount={payment.amountUzs + payment.amountUsd * (payment.usdToUzsRate ?? 0)} currency="UZS" /></strong>
      ),
    },
    {
      title: t('customers.paymentsMethod'),
      dataIndex: 'paymentMethod',
      width: 150,
      responsiveHide: true,
      render: (method: PaymentMethod) => t(`payment.${method}`),
    },
    {
      title: t('customers.paymentsReceivedBy'),
      key: 'receivedBy',
      width: 160,
      responsiveHide: true,
      render: (_: unknown, payment: DebtPayment) => <span className="u-text-muted u-fs-12-5">{payment.receivedBy.fullName}</span>,
    },
    {
      title: t('customers.paymentsRemainingDebt'),
      key: 'remainingDebt',
      width: 160,
      align: 'right',
      render: (_: unknown, payment: DebtPayment) => <span className="num"><MoneyDisplay amount={payment.sale.debtAmountUzs} currency="UZS" /></span>,
    },
  ]
}
