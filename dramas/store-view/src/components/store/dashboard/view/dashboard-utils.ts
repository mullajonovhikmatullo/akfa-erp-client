import type { StoreTranslator } from '@store/store-i18n'
import dayjs from 'dayjs';
import type {
  AnalyticsQuery,
  ExpenseReportData,
  PaymentMethod,
  SalesReportData,
} from '@store/store-stub';
import type { PaymentChartDatum, TrendDatum } from './types';

export const COLORS = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  muted: 'var(--ink-3)',
  cyan: '#0891b2',
  violet: '#7c3aed',
};

export const DASH_DOT_FILL = 'var(--surface)';
export const DASH_GRID = 'var(--grid)';
export const DASH_TICK = 'var(--ink-3)';

const CHART_COLORS = ['#6f8ff2', '#68bd83', '#e0aa55', '#e47f7f', '#61afbf', '#9a83de'];

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER', 'MIXED', 'CREDIT'];
export const TOP_PRODUCTS_LIMIT = 10;

export const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length] ?? COLORS.primary;

export const getDashboardColorClass = (color: string) => {
  //
  const index = CHART_COLORS.indexOf(color)
  return index >= 0 ? `dashboard-color-${index}` : 'dashboard-color-primary'
};

export const getTodayRange = (): [dayjs.Dayjs, dayjs.Dayjs] => [dayjs().startOf('day'), dayjs().endOf('day')];

interface TrendDataOptions {
  chartPeriod: NonNullable<AnalyticsQuery['period']>;
  rangeStart: dayjs.Dayjs;
  rangeEnd: dayjs.Dayjs;
  sales?: SalesReportData;
  expenses?: ExpenseReportData;
}

function getTrendKey(date: dayjs.Dayjs, chartPeriod: NonNullable<AnalyticsQuery['period']>) {
  //
  if (chartPeriod === 'month') return date.format('YYYY-MM');
  if (chartPeriod === 'week') return date.startOf('week').format('YYYY-MM-DD');
  return date.format('YYYY-MM-DD');
}

function getTrendLabel(date: dayjs.Dayjs, chartPeriod: NonNullable<AnalyticsQuery['period']>) {
  //
  if (chartPeriod === 'month') return date.format('MMM YYYY');
  return date.format('DD MMM');
}

export function createTrendData({
  chartPeriod,
  rangeStart,
  rangeEnd,
  sales,
  expenses,
}: TrendDataOptions): TrendDatum[] {
  //
  const buckets: TrendDatum[] = [];
  let cursor =
    chartPeriod === 'month'
      ? rangeStart.startOf('month')
      : chartPeriod === 'week'
        ? rangeStart.startOf('week')
        : rangeStart.startOf('day');
  const endCursor =
    chartPeriod === 'month'
      ? rangeEnd.startOf('month')
      : chartPeriod === 'week'
        ? rangeEnd.startOf('week')
        : rangeEnd.startOf('day');

  while (cursor.isBefore(endCursor) || cursor.isSame(endCursor)) {
    buckets.push({
      iso: getTrendKey(cursor, chartPeriod),
      label: getTrendLabel(cursor, chartPeriod),
      revenue: 0,
      paid: 0,
      debt: 0,
      expenses: 0,
    });
    cursor = cursor.add(1, chartPeriod);
  }

  const byIso = new Map(buckets.map((bucket) => [bucket.iso, bucket]));
  sales?.byPeriod.forEach((row) => {
    //
    const target = byIso.get(getTrendKey(dayjs(row.period), chartPeriod));
    if (!target) return;
    target.revenue = row.totalRevenue;
    target.paid = row.paidAmount;
    target.debt = Math.max(0, row.totalRevenue - row.paidAmount);
  });
  expenses?.byPeriod.forEach((row) => {
    //
    const target = byIso.get(getTrendKey(dayjs(row.period), chartPeriod));
    if (target) target.expenses = row.amount;
  });
  return buckets;
}

export function createPaymentChartData(
  rows: SalesReportData['byPaymentMethod'],
  t: StoreTranslator,
) {
  //
  const rowsByMethod = new Map(rows.map((row) => [row.paymentMethod, row]));
  const paymentData = PAYMENT_METHODS.map((method) => ({
    name: t(`payment.${method}`),
    value: rowsByMethod.get(method)?.amount ?? 0,
    count: rowsByMethod.get(method)?.count ?? 0,
  }));
  const total = paymentData.reduce((sum, item) => sum + item.value, 0);
  const data: PaymentChartDatum[] = paymentData
    .map((item, index) => ({
      ...item,
      order: index,
      color: getChartColor(index),
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }))
    .sort((left, right) => right.value - left.value || left.order - right.order);

  return { data, total };
}

export function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  //
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  //
  const angleRad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}
