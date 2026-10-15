import type { Currency, PaymentStatus, PlanBillingType, StoreStatus } from '@store/platform-stub';

export const storeStatusLabels: Record<StoreStatus, string> = {
  TRIALING: 'Sinovda',
  ACTIVE: 'Faol',
  PAST_DUE: 'To‘lov kutilmoqda',
  SUSPENDED: 'Bloklangan',
  CANCELLED: 'Bekor qilingan',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
};

export const billingTypeLabels: Record<PlanBillingType, string> = {
  MONTHLY: 'Oylik',
  LIFETIME: 'Bir martalik',
};

const numberFormat = (fractionDigits: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: fractionDigits });

export const formatNumber = (value: number) => numberFormat(0).format(value).replace(/ /g, ' ');

export const formatMoney = (amount: number, currency: Currency = 'UZS') =>
  currency === 'USD'
    ? `$${numberFormat(2).format(amount).replace(/ /g, ' ')}`
    : `${numberFormat(0).format(amount).replace(/ /g, ' ')} so‘m`;

type PricedPlan = { billingType: PlanBillingType; monthlyPriceUzs: number; oneTimePriceUsd: number | null };

export const formatPlanPrice = (plan: PricedPlan) =>
  plan.billingType === 'LIFETIME'
    ? `${formatMoney(plan.oneTimePriceUsd ?? 0, 'USD')} bir marta`
    : `${formatMoney(plan.monthlyPriceUzs)} / oy`;

const dateFormat = new Intl.DateTimeFormat('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('uz-UZ', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (value: string | null | undefined) => (value ? dateFormat.format(new Date(value)) : '—');

export const formatDateTime = (value: string | null | undefined) =>
  value ? dateTimeFormat.format(new Date(value)) : '—';

export const daysUntil = (value: string | null | undefined) => {
  //
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
};

export const formatLimit = (used: number, limit: number | null) => (limit === null ? `${used}` : `${used}/${limit}`);
