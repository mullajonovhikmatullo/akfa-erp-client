import { StoreIcon } from '@store/store-shared/ui/store-icon'

import type { BillingTranslate } from './types'

export function BillingPendingNotice({ t }: { t: BillingTranslate }) {
  //
  return (
    <div className="billing-notice" role="status">
      <StoreIcon name="warning" size={20} />
      <div>
        <strong>{t('billing.pendingTitle')}</strong>
        <span>{t('billing.pendingDescription')}</span>
      </div>
    </div>
  )
}

