import { useStoreT } from '@store/store-i18n'
import { Link } from 'react-router-dom'
import { Alert } from 'antd'
import { ROUTES } from '@/shared/config/routes'

export function PastDueAlert({ canManageBilling, lifetime }: { canManageBilling: boolean; lifetime: boolean }) {
  //
  const t = useStoreT()

  return (
    <Alert
      type="warning"
      showIcon
      banner
      message={t('billing.overdueTitle')}
      description={t(lifetime ? 'billing.lifetimeAwaitingDescription' : 'billing.overdueDescription')}
      action={canManageBilling ? (
        <Link className="billing-alert-action" to={ROUTES.BILLING}>{t('billing.payButton')}</Link>
      ) : undefined}
    />
  )
}
