import { Button, Tag } from 'antd'

import type { PublicBillingPlan } from '@store/store-stub'
import { formatBillingMoney, getPlanFeatures } from '../lib/billing-formatters'
import type { BillingTranslate } from './types'

interface BillingPlanCardProps {
  plan: PublicBillingPlan
  current: boolean
  upgrade: boolean
  upgradeHref: string
  t: BillingTranslate
}

export function BillingPlanCard({ plan, current, upgrade, upgradeHref, t }: BillingPlanCardProps) {
  //
  const className = [
    'billing-plan-card',
    current ? 'billing-plan-card--current' : null,
    upgrade ? 'billing-plan-card--upgrade' : null,
  ].filter(Boolean).join(' ')

  return (
    <article className={className}>
      <div className="billing-plan-card__head">
        <span className="billing-plan-card__icon">
          {current ? (
            <i className="icons-tariff icon-size-20" />
          ) : upgrade ? (
            <i className="icons-favourite icon-size-20" />
          ) : (
            <i className="icons-payments icon-size-20" />
          )}
        </span>
        <div>
          <span className="billing-plan-card__eyebrow">
            {current ? t('billing.currentPlanLabel') : t('billing.plan')}
          </span>
          <h2>{plan.name}</h2>
        </div>
        {current ? <Tag color="blue">{t('billing.currentPlanLabel')}</Tag> : null}
        {upgrade ? <Tag color="gold">{t('billing.upgradeTitle')}</Tag> : null}
      </div>
      <div className="billing-plan-card__price">
        <strong>{formatBillingMoney(plan.monthlyPriceUzs)}</strong>
        <span>/ oy</span>
      </div>
      <p className="billing-plan-card__description">
        {upgrade ? t('billing.upgradeDescription') : t('billing.featuresDescription')}
      </p>
      <ul className="billing-plan-card__features">
        {getPlanFeatures(plan, t).map((feature) => (
          <li key={feature}>
            <i className="icons-circle-check icon-size-16" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {upgrade ? (
        <Button
          className="billing-plan-action billing-plan-action--upgrade"
          type="primary"
          block
          href={upgradeHref}
          target="_blank"
          rel="noreferrer"
        >
          {t('billing.upgradeButton')}
        </Button>
      ) : null}
    </article>
  )
}

