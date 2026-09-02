import dayjs from 'dayjs';
import type { PaymentMethod } from '@store/store-stub';

export const COLORS = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  muted: 'var(--ink-3)',
  cyan: '#0891b2',
  violet: '#7c3aed',
};

export const DASH_PANEL_BG = 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%)';
export const DASH_DOT_FILL = 'var(--surface)';
export const DASH_GRID = 'var(--grid)';
export const DASH_TICK = 'var(--ink-3)';
export const DASH_TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink-2)',
  fontSize: 12,
};

const CHART_COLORS = ['#6f8ff2', '#68bd83', '#e0aa55', '#e47f7f', '#61afbf', '#9a83de'];

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER', 'MIXED', 'CREDIT'];
export const TOP_PRODUCTS_LIMIT = 10;

export const getChartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length] ?? COLORS.primary;

export const getColorHalo = (color: string) =>
  color.startsWith('var(')
    ? `color-mix(in srgb, ${color} 18%, transparent)`
    : `${color}22`;

export const getTodayRange = (): [dayjs.Dayjs, dayjs.Dayjs] => [dayjs().startOf('day'), dayjs().endOf('day')];

export function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  //
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const angleRad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}
