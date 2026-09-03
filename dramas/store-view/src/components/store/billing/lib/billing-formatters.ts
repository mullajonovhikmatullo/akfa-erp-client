import type { PublicBillingPlan } from '@store/store-stub'
import type { BillingTranslate } from '../view/types'

type PlanFeatureSource = Pick<
  PublicBillingPlan,
  'code' | 'name' | 'maxBranches' | 'maxUsers' | 'maxProducts'
>

export function formatBillingMoney(amount: number, currency: 'UZS' | 'USD' = 'UZS') {
  //
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatBillingDateTime(value?: string | null) {
  //
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatBillingDate(value?: string | null) {
  //
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export function normalizePlanCode(code?: string | null) {
  //
  return code?.trim().toUpperCase() ?? ''
}

export function getPlanFeatures(plan: PlanFeatureSource, t: BillingTranslate) {
  //
  const planCode = normalizePlanCode(plan.code ?? plan.name)

  return [
    plan.maxBranches === null
      ? t('billing.featureUnlimitedBranches')
      : typeof plan.maxBranches === 'number'
        ? t('billing.featureBranches').replace('{count}', String(Math.max(plan.maxBranches - 1, 0)))
        : null,
    plan.maxUsers === null
      ? t('billing.featureUnlimitedUsers')
      : typeof plan.maxUsers === 'number'
        ? t('billing.featureUsers').replace('{count}', String(plan.maxUsers))
        : null,
    plan.maxProducts === null
      ? t('billing.featureUnlimitedProducts')
      : typeof plan.maxProducts === 'number'
        ? t('billing.featureProducts').replace('{count}', String(plan.maxProducts))
        : null,
    planCode === 'START' ? t('billing.featureBasicReports') : t('billing.featureAdvancedReports'),
    ...(planCode === 'START'
      ? [t('billing.featureEmailSupport')]
      : planCode === 'BUSINESS'
        ? [t('billing.featureTransfers'), t('billing.featurePrioritySupport')]
        : [
            t('billing.featureIndividual'),
            t('billing.featureIntegrations'),
            t('billing.featureManager'),
            t('billing.featureCustomSupport'),
          ]),
  ].filter((feature): feature is string => Boolean(feature))
}

