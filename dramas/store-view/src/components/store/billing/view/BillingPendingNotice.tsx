
import type { BillingTranslate } from './types'

export function BillingPendingNotice({ t }: { t: BillingTranslate }) {
  //
  return (
    <div className="billing-notice" role="status">
      <i className="icons-warning icon-size-20" />
      <div>
        <strong>{t('billing.pendingTitle')}</strong>
        <span>{t('billing.pendingDescription')}</span>
      </div>
    </div>
  )
}

