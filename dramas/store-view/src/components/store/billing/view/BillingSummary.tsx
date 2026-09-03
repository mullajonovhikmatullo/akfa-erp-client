import { Tag } from 'antd'
import type { StoreStatus, TenantBillingSummary } from '@store/store-stub'
import { formatBillingDate, formatBillingMoney } from '../lib/billing-formatters'
import type { BillingTranslate } from './types'

const STORE_STATUS_COLORS: Record<StoreStatus, string> = {
  TRIALING: 'blue',
  ACTIVE: 'green',
  PAST_DUE: 'orange',
  SUSPENDED: 'red',
  CANCELLED: 'default',
}

export function BillingSummary({
  summary,
  t,
}: {
  summary?: TenantBillingSummary
  t: BillingTranslate
}) {
  //
  const dueDate = summary?.subscription?.nextPaymentDueAt ?? summary?.subscription?.trialEndsAt

  return (
    <div className="billing-summary">
      <div>
        <span>{t('billing.plan')}</span>
        <strong>{summary?.plan?.name ?? '—'}</strong>
      </div>
      <div>
        <span>{t('billing.monthlyPrice')}</span>
        <strong>{summary?.plan ? formatBillingMoney(summary.plan.monthlyPriceUzs ?? 0) : '—'}</strong>
      </div>
      <div>
        <span>{t('billing.currentStatus')}</span>
        {summary ? (
          <Tag className="billing-summary-status" color={STORE_STATUS_COLORS[summary.status]}>
            {t(`billing.storeStatus.${summary.status}`)}
          </Tag>
        ) : (
          <strong>—</strong>
        )}
      </div>
      <div>
        <span>{t('billing.nextDue')}</span>
        <strong>{formatBillingDate(dueDate)}</strong>
      </div>
    </div>
  )
}

