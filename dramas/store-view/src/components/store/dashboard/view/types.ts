import type { ExpenseReportData, SalesReportData } from '@store/store-stub';
import type { Dayjs } from 'dayjs';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

type PaymentReportRow = SalesReportData['byPaymentMethod'][number];
type SalesPeriodRow = SalesReportData['byPeriod'][number];
type ExpensePeriodRow = ExpenseReportData['byPeriod'][number];
type TopProductRow = SalesReportData['topProducts'][number];

export type PaymentChartDatum = {
  name: string;
  value: PaymentReportRow['amount'];
  count: PaymentReportRow['count'];
  color: string;
  percent: number;
};

export type TrendDatum = {
  iso: string;
  label: string;
  revenue: SalesPeriodRow['totalRevenue'];
  paid: SalesPeriodRow['paidAmount'];
  debt: number;
  expenses: ExpensePeriodRow['amount'];
};

export type TopProductChartDatum = {
  name: TopProductRow['name'];
  sku: TopProductRow['sku'];
  unit: TopProductRow['unit'];
  quantity: TopProductRow['totalQuantity'];
  revenue: TopProductRow['totalRevenue'];
  color: string;
};

export type DashboardFiltersForm = {
  dateRange: [Dayjs | null, Dayjs | null];
};

export type TFunc = (key: string) => string;
