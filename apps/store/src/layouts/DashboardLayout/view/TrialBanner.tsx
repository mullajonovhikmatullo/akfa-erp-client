import { Link } from 'react-router-dom'

import { ROUTES } from '@/shared/config/routes'

interface TrialBannerProps {
  daysLeft: number
  canManageBilling: boolean
  t: (key: string) => string
}

export function TrialBanner({ daysLeft, canManageBilling, t }: TrialBannerProps) {
  //
  return (
    <div className={`trial-banner${daysLeft <= 3 ? ' trial-banner--urgent' : ''}`} role="status">
      <div className="trial-banner__pulse"><i className="icons-overdue-time icon-size-22" /></div>
      <div className="trial-banner__copy">
        <strong>{t('trial.active')}</strong>
        <span>{t('trial.description')}</span>
      </div>
      <div className="trial-banner__remaining">
        <strong>{daysLeft}</strong>
        <span>{t('trial.daysLeft')}</span>
      </div>
      {canManageBilling ? (
        <Link className="trial-banner__action" to={ROUTES.BILLING}>{t('trial.paymentAction')}</Link>
      ) : null}
    </div>
  )
}
