import { WarningCircle } from '@phosphor-icons/react'
import type { BillingTranslate } from './types'

export function BillingPendingNotice({ t }: { t: BillingTranslate }) {
  //
  return (
    <div className="billing-notice" role="status">
      <WarningCircle size={20} weight="duotone" />
      <div>
        <strong>{t('billing.pendingTitle')}</strong>
        <span>{t('billing.pendingDescription')}</span>
      </div>
    </div>
  )
}

