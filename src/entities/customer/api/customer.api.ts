import { apiClient } from '@/shared/api/client';
import type { Customer, RecentSale } from '@/shared/types/domain';

const parseCustomer = (raw: Record<string, unknown>): Customer => ({
  ...(raw as unknown as Customer),
  balance: Number(raw.balance),
});

export interface CustomerFilters {
  search?: string;
  branchId?: string;
  isActive?: boolean;
  hasDebt?: boolean;
}

export interface CreateCustomerPayload {
  fullName: string;
  phone?: string | null;
  address?: string | null;
  branchId?: string;
  balance?: number;
}

export interface UpdateCustomerPayload {
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface CustomerDetail extends Customer {
  recentSales: RecentSale[];
}

const parseDetail = (raw: Record<string, unknown>): CustomerDetail => ({
  ...parseCustomer(raw),
  recentSales: ((raw.recentSales as Record<string, unknown>[]) ?? []).map((s) => ({
    ...(s as unknown as RecentSale),
    totalAmountUzs: Number(s.totalAmountUzs),
    paidAmountUzs: Number(s.paidAmountUzs),
    debtAmountUzs: Number(s.debtAmountUzs),
  })),
});

export const customerApi = {
  list: (params?: CustomerFilters) =>
    apiClient.get('/customers', { params }).then((r) =>
      (r.data.data as Record<string, unknown>[]).map(parseCustomer),
    ),

  getById: (id: string) =>
    apiClient.get(`/customers/${id}`).then((r) => parseDetail(r.data.data)),

  create: (payload: CreateCustomerPayload) =>
    apiClient.post('/customers', payload).then((r) => parseCustomer(r.data.data)),

  update: (id: string, payload: UpdateCustomerPayload) =>
    apiClient.patch(`/customers/${id}`, payload).then((r) => parseCustomer(r.data.data)),

  remove: (id: string) => apiClient.delete(`/customers/${id}`),
};
