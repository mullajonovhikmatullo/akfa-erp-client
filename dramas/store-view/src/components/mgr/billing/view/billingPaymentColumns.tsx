import { Button, Tag, Tooltip, type TableColumnsType } from 'antd'
import { Eye } from '@phosphor-icons/react'
import type { PaymentStatus, TenantPayment } from '@store/store-stub'
import { formatBillingDate, formatBillingDateTime, formatBillingMoney } from '../lib/billing-formatters'
import { PaymentDetailsPopover } from './PaymentDetailsPopover'
import type { BillingTranslate } from './types'

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
}

interface BillingPaymentColumnsOptions {
  t: BillingTranslate
  openingReceiptId: string | null
  onOpenReceipt: (payment: TenantPayment) => void
}

export function createBillingPaymentColumns({
  t,
  openingReceiptId,
  onOpenReceipt,
}: BillingPaymentColumnsOptions): TableColumnsType<TenantPayment> {
  //
  return [
    {
      title: t('billing.submittedAt'),
      key: 'submittedAt',
      width: 175,
      render: (_value, payment) => (
        <span className="billing-table-date">{formatBillingDateTime(payment.createdAt)}</span>
      ),
    },
    {
      title: t('billing.branch'),
      key: 'branch',
      width: 150,
      render: (_value, payment) => (
        <span className="billing-table-branch">{payment.branch?.name ?? '—'}</span>
      ),
    },
    {
      title: t('billing.amount'),
      key: 'amount',
      width: 155,
      render: (_value, payment) => (
        <div className="billing-table-amount">
          <strong>{formatBillingMoney(payment.amount, payment.currency)}</strong>
          <span>{payment.currency}</span>
        </div>
      ),
    },
    {
      title: t('billing.period'),
      key: 'period',
      width: 220,
      render: (_value, payment) => (
        <div className="billing-table-period">
          <strong>{formatBillingDate(payment.periodStart)}</strong>
          <span>→ {formatBillingDate(payment.periodEnd)}</span>
        </div>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PaymentStatus) => (
        <Tag color={PAYMENT_STATUS_COLORS[status]}>{t(`billing.paymentStatus.${status}`)}</Tag>
      ),
    },
    {
      title: t('billing.receipt'),
      key: 'receipt',
      width: 100,
      render: (_value, payment) => payment.receiptMedia ? (
        <Tooltip title={t('common.view')}>
          <Button
            type="text"
            shape="circle"
            aria-label={t('common.view')}
            icon={<Eye size={18} />}
            loading={openingReceiptId === payment.receiptMedia.id}
            onClick={() => onOpenReceipt(payment)}
          />
        </Tooltip>
      ) : <span className="billing-table-empty">—</span>,
    },
    {
      title: t('billing.details'),
      key: 'details',
      width: 95,
      align: 'center',
      render: (_value, payment) => <PaymentDetailsPopover payment={payment} t={t} />,
    },
  ]
}

