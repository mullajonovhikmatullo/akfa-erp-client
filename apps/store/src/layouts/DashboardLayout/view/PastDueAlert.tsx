import { Link } from 'react-router-dom'
import { Alert } from 'antd'
import { ROUTES } from '@/shared/config/routes'

export function PastDueAlert({ canManageBilling, t }: { canManageBilling: boolean; t: (key: string) => string }) {
  //
  return (
    <Alert
      type="warning"
      showIcon
      banner
      message={t('billing.overdueTitle')}
      description={t('billing.overdueDescription')}
      action={canManageBilling ? (
        <Link className="billing-alert-action" to={ROUTES.BILLING}>{t('billing.payButton')}</Link>
      ) : undefined}
    />
  )
}
