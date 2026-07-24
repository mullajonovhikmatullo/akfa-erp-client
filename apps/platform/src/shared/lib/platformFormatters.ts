import type { Currency, PaymentStatus, StoreStatus } from '@store/platform-stub';

export const storeStatusLabels: Record<StoreStatus, string> = {
  TRIALING: 'Sinov muddatida',
  ACTIVE: 'Faol',
  PAST_DUE: 'Qarzdor',
  SUSPENDED: 'Bloklangan',
  CANCELLED: 'Bekor qilingan',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
};

export const currencyLabels: Record<Currency, string> = {
  UZS: 'UZS',
  USD: 'USD',
};

const dateFormatter = new Intl.DateTimeFormat('uz-UZ', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDateTime = (value: string | null) => (value ? dateFormatter.format(new Date(value)) : '-');

export const formatMoney = (amount: number, currency: Currency = 'UZS') =>
  `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: currency === 'UZS' ? 0 : 2 })
    .format(amount)
    .replace(/\u00A0/g, ' ')} ${currency}`;

export const formatLimitCount = (count: number, label: string) => `${count} ta ${label}`;
