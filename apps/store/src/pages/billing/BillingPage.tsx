import { BillingPanel } from '@store/store-view/billing'
import { useT } from '@/shared/lib/i18n'

export function BillingPage() {
  //
  const t = useT()

  return <BillingPanel t={t} />
}
