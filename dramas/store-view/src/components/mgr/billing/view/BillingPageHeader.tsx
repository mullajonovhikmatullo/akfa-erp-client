import { Button, Tooltip } from 'antd'
import { ArrowClockwiseIcon, CreditCardIcon } from '@phosphor-icons/react'
import type { BillingTranslate } from './types'

interface BillingPageHeaderProps {
  t: BillingTranslate
  fetching: boolean
  hasPlan: boolean
  hasPendingPayment: boolean
  onPay: () => void
  onRefresh: () => void
}

export function BillingPageHeader({
  t,
  fetching,
  hasPlan,
  hasPendingPayment,
  onPay,
  onRefresh,
}: BillingPageHeaderProps) {
  //
  return (
    <div className="page-head">
      <div>
        <h1>{t('billing.title')}</h1>
        <div className="sub">{t('billing.subtitle')}</div>
      </div>
      <div className="billing-page__actions">
        <Button
          type="primary"
          icon={<CreditCardIcon size={18} weight="duotone" />}
          disabled={!hasPlan || hasPendingPayment}
          onClick={onPay}
        >
          {hasPendingPayment ? t('billing.pendingButton') : t('billing.payButton')}
        </Button>
        <Tooltip title={t('common.refresh')}>
          <Button
            aria-label={t('common.refresh')}
            icon={<ArrowClockwiseIcon size={18} className={fetching ? 'ph-icon-spin' : undefined} />}
            onClick={onRefresh}
          />
        </Tooltip>
      </div>
    </div>
  )
}

