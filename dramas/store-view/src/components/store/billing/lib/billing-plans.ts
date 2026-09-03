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
  storeName?: string,
  currentPlanName?: string,
) {
  //
  const subject = `Mavion tarifini yangilash: ${targetPlan.name}`
  const body = [
    'Assalomu alaykum,',
    '',
    'Akkauntim uchun quyidagi tarifga o‘tish bo‘yicha yordam kerak:',
    `Do‘kon: ${storeName ?? '—'}`,
    `Joriy tarif: ${currentPlanName ?? '—'}`,
    `Tanlangan tarif: ${targetPlan.name}`,
    '',
    'Rahmat.',
  ].join('\n')

  return `https://t.me/mullajonovhikmatullo?text=${encodeURIComponent(`${subject}\n\n${body}`)}`
}

