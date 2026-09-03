import { Skeleton } from 'antd'
import type { PublicBillingPlan, TenantBillingSummary } from '@store/store-stub'
import {
  createBillingPlanCards,
  createUpgradeRequestHref,
  isBillingPlanUpgrade,
  isCurrentBillingPlan,
} from '../lib/billing-plans'
import { BillingPlanCard } from './BillingPlanCard'
import type { BillingTranslate } from './types'

interface BillingPlanCardsProps {
  summary?: TenantBillingSummary
  publicPlans: PublicBillingPlan[]
  loading: boolean
  t: BillingTranslate
}

export function BillingPlanCards({ summary, publicPlans, loading, t }: BillingPlanCardsProps) {
  //
  if (loading) {
    return (
      <div className="billing-plan-cards billing-plan-cards--loading" aria-busy="true">
        {[0, 1, 2].map((card) => (
          <article className="billing-plan-card billing-plan-card--skeleton" key={card}>
            <Skeleton active title={{ width: card === 1 ? '54%' : '46%' }} paragraph={{ rows: 5 }} />
          </article>
        ))}
      </div>
    )
  }

  if (!summary?.plan) return null

  return (
    <div className="billing-plan-cards">
      {createBillingPlanCards(summary.plan, publicPlans).map((plan) => (
        <BillingPlanCard
          key={plan.code}
          plan={plan}
          current={isCurrentBillingPlan(plan, summary.plan)}
          upgrade={isBillingPlanUpgrade(plan, summary.plan)}
          upgradeHref={createUpgradeRequestHref(plan, t, summary.name, summary.plan?.name)}
          t={t}
        />
      ))}
    </div>
  )
}
