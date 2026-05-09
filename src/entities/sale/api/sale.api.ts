import { apiClient } from '@/shared/api/client';
import type { SaleListItem, SaleDetail, SaleType, PaymentMethod } from '@/shared/types/domain';

type Raw = Record<string, unknown>;

const parseSale = (raw: Raw): SaleListItem => ({
  ...(raw as unknown as SaleListItem),
  totalAmountUzs: Number(raw.totalAmountUzs),
  paidAmountUzs: Number(raw.paidAmountUzs),
  debtAmountUzs: Number(raw.debtAmountUzs),
});

const parseSaleDetail = (raw: Raw): SaleDetail => ({
  ...parseSale(raw),
  items: ((raw.items as Raw[]) ?? []).map((i) => ({
    ...(i as unknown as SaleDetail['items'][0]),
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  })),
  payments: ((raw.payments as Raw[]) ?? []).map((p) => ({
    ...(p as unknown as SaleDetail['payments'][0]),
    amountUzs: Number(p.amountUzs),
    amountUsd: Number(p.amountUsd),
    usdToUzsRate: p.usdToUzsRate != null ? Number(p.usdToUzsRate) : null,
  })),
});

export interface SaleFilters {
  branchId?: string;
  customerId?: string;
  saleType?: SaleType;
  hasDebt?: boolean;
  overdue?: boolean;
  from?: string;
  to?: string;
  limit?: number;
}

export interface CreateSalePayload {
  branchId?: string;
  customerId?: string;
  saleType: SaleType;
  items: { productId: string; quantity: number }[];
  paidAmountUzs?: number;
  paidAmountUsd?: number;
  usdToUzsRate?: number;
  paymentMethod: PaymentMethod;
  debtDueDate?: string | null;
  note?: string;
}

export interface AddPaymentPayload {
  amountUzs?: number;
  amountUsd?: number;
  usdToUzsRate?: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

export const saleApi = {
  list: (params?: SaleFilters) =>
    apiClient.get('/sales', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseSale),
    ),

  getById: (id: string) =>
    apiClient.get(`/sales/${id}`).then((r) => parseSaleDetail(r.data.data)),

  create: (payload: CreateSalePayload) =>
    apiClient.post('/sales', payload).then((r) => parseSaleDetail(r.data.data)),

  addPayment: (saleId: string, payload: AddPaymentPayload) =>
    apiClient.post(`/sales/${saleId}/payments`, payload).then((r) => parseSaleDetail(r.data.data)),

  setDebtDeadline: (saleId: string, debtDueDate: string | null) =>
    apiClient.patch(`/sales/${saleId}/debt-deadline`, { debtDueDate }).then((r) => parseSale(r.data.data)),
};
