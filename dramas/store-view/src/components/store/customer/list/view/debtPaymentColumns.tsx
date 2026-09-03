import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { DebtPayment, PaymentMethod } from '@store/store-stub'

export function createDebtPaymentColumns(t: (key: string) => string): ColumnDef<DebtPayment>[] {
  //
  return [
    { title: t('common.date'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDateTime(value) },
    {
      title: t('nav.customers'),
      key: 'customer',
      render: (_, payment) => <div><strong>{payment.sale.customer?.fullName ?? '—'}</strong><div className="u-text-muted u-fs-12">{payment.sale.customer?.phone ?? '—'}</div></div>,
    },
    { title: t('common.branch'), key: 'branch', width: 150, render: (_, payment) => <StatusBadge tone="muted">{payment.sale.branch.name}</StatusBadge> },
    { title: t('customers.paymentsAmount'), key: 'amount', width: 170, align: 'right', render: (_, payment) => <strong className="num"><MoneyDisplay amount={payment.amountUzs + payment.amountUsd * (payment.usdToUzsRate ?? 0)} currency="UZS" /></strong> },
    { title: t('customers.paymentsMethod'), dataIndex: 'paymentMethod', width: 160, render: (method: PaymentMethod) => t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method] },
    { title: t('customers.paymentsReceivedBy'), key: 'receivedBy', width: 170, render: (_, payment) => payment.receivedBy.fullName },
    { title: t('customers.paymentsRemainingDebt'), key: 'remainingDebt', width: 170, align: 'right', render: (_, payment) => <MoneyDisplay amount={payment.sale.debtAmountUzs} currency="UZS" /> },
  ]
}
