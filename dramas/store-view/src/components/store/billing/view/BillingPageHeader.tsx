import { Button, Tooltip } from 'antd'

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
          icon={<i className="icons-payments icon-size-18" />}
          disabled={!hasPlan || hasPendingPayment}
          onClick={onPay}
        >
          {hasPendingPayment ? t('billing.pendingButton') : t('billing.payButton')}
        </Button>
        <Tooltip title={t('common.refresh')}>
          <Button
            aria-label={t('common.refresh')}
            icon={<i className={['icons-reload icon-size-18', fetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />}
            onClick={onRefresh}
          />
        </Tooltip>
      </div>
    </div>
  )
}

