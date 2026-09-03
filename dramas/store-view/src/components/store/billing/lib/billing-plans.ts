import type { StoreTranslator } from '@store/store-i18n'
import type { PublicBillingPlan, TenantBillingSummary } from '@store/store-stub'
import { normalizePlanCode } from './billing-formatters'

type CurrentPlan = NonNullable<TenantBillingSummary['plan']>

export function createBillingPlanCards(
  currentPlan: CurrentPlan | null | undefined,
  publicPlans: PublicBillingPlan[],
) {
  //
  const matchingPublicPlan = publicPlans.find(
    (candidate) =>
      normalizePlanCode(candidate.code) === normalizePlanCode(currentPlan?.code) ||
      normalizePlanCode(candidate.name) === normalizePlanCode(currentPlan?.name),
  )
  const fallback: PublicBillingPlan | null = currentPlan && !matchingPublicPlan
    ? {
        code: currentPlan.code ?? 'CURRENT',
        name: currentPlan.name ?? '—',
        monthlyPriceUzs: currentPlan.monthlyPriceUzs ?? 0,
        maxBranches: currentPlan.maxBranches ?? null,
        maxUsers: currentPlan.maxUsers ?? null,
        maxProducts: currentPlan.maxProducts ?? null,
      }
    : null

  return [...(fallback ? [fallback] : []), ...publicPlans]
    .sort((left, right) => left.monthlyPriceUzs - right.monthlyPriceUzs)
}

export function isCurrentBillingPlan(
  candidate: PublicBillingPlan,
  currentPlan: CurrentPlan | null | undefined,
) {
  //
  if (!currentPlan) return false
  return (
    normalizePlanCode(candidate.code) === normalizePlanCode(currentPlan.code) ||
    normalizePlanCode(candidate.name) === normalizePlanCode(currentPlan.name)
  )
}

export function isBillingPlanUpgrade(
  candidate: PublicBillingPlan,
  currentPlan: CurrentPlan | null | undefined,
) {
  //
  return (
    !isCurrentBillingPlan(candidate, currentPlan) &&
    typeof currentPlan?.monthlyPriceUzs === 'number' &&
    candidate.monthlyPriceUzs > currentPlan.monthlyPriceUzs
  )
}

export function createUpgradeRequestHref(
  targetPlan: Pick<PublicBillingPlan, 'name'>,
  t: StoreTranslator,
  storeName?: string,
  currentPlanName?: string,
) {
  //
  const subject = t('billing.upgradeRequestSubject', { plan: targetPlan.name })
  const body = t('billing.upgradeRequestBody', {
    store: storeName ?? '—',
    currentPlan: currentPlanName ?? '—',
    targetPlan: targetPlan.name,
  })

  return `https://t.me/mullajonovhikmatullo?text=${encodeURIComponent(`${subject}\n\n${body}`)}`
}
