import { StoreIcon } from '@store/store-shared/ui/store-icon'
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
            <StoreIcon name="tariff" size={20} />
          ) : upgrade ? (
            <StoreIcon name="favourite" size={20} />
          ) : (
            <StoreIcon name="payments" size={20} />
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
        <span>{t('billing.perMonth')}</span>
      </div>
      <p className="billing-plan-card__description">
        {upgrade ? t('billing.upgradeDescription') : t('billing.featuresDescription')}
      </p>
      <ul className="billing-plan-card__features">
        {getPlanFeatures(plan, t).map((feature) => (
          <li key={feature}>
            <StoreIcon name="circle-check" size={18} />
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
