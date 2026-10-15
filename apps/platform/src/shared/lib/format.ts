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

// Browsers ship little or no `uz` locale data, so Intl prints things like "M10 15, Thu".
const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const shortMonths = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
const weekdays = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];

const pad = (value: number) => String(value).padStart(2, '0');

const shortDay = (date: Date) => {
  const day = `${date.getDate()}-${shortMonths[date.getMonth()]}`;
  return date.getFullYear() === new Date().getFullYear() ? day : `${day} ${date.getFullYear()}`;
};

export const formatDate = (value: string | null | undefined) => (value ? shortDay(new Date(value)) : '—');

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  return `${shortDay(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatLongToday = (date = new Date()) =>
  `${date.getDate()}-${months[date.getMonth()]}, ${weekdays[date.getDay()]}`;

export const daysUntil = (value: string | null | undefined) => {
  //
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
};

export const formatLimit = (used: number, limit: number | null) => (limit === null ? formatNumber(used) : `${formatNumber(used)}/${formatNumber(limit)}`);
