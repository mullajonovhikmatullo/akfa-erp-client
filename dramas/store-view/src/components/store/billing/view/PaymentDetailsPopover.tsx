import { Button, Popover } from 'antd'

import type { TenantPayment } from '@store/store-stub'
import type { BillingTranslate } from './types'

export function PaymentDetailsPopover({ payment, t }: { payment: TenantPayment; t: BillingTranslate }) {
  //
  const rejectionReason = payment.rejectionReason?.trim()
  const note = payment.note?.trim()
  const hasDetails = Boolean(rejectionReason || note || payment.status === 'REJECTED')

  if (!hasDetails) return <span className="billing-table-empty">—</span>

  return (
    <Popover
      title={payment.status === 'REJECTED' ? t('billing.rejectionReasonTitle') : t('billing.paymentDetails')}
      trigger="click"
      placement="topRight"
      content={
        <div className="billing-payment-details-popover">
          {payment.status === 'REJECTED' ? (
            <div className="billing-payment-details-popover__item billing-payment-details-popover__item--danger">
              <span>{t('billing.rejectionReason')}</span>
              <p>{rejectionReason || t('billing.noRejectionReason')}</p>
            </div>
          ) : null}
          {note ? (
            <div className="billing-payment-details-popover__item">
              <span>{t('billing.note')}</span>
              <p>{note}</p>
            </div>
          ) : null}
        </div>
      }
    >
      <Button
        type="text"
        shape="circle"
        className="billing-payment-details-button"
        aria-label={payment.status === 'REJECTED' ? t('billing.rejectionReason') : t('billing.paymentDetails')}
        icon={<i className="icons-info icon-size-18" />}
      />
    </Popover>
  )
}

