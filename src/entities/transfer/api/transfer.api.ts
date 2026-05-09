import { apiClient } from '@/shared/api/client';
import type { Transfer, TransferStatus } from '@/shared/types/domain';

type Raw = Record<string, unknown>;

const parseItem = (i: Raw) => ({
  ...(i as unknown as Transfer['items'][0]),
  quantity: Number(i.quantity),
  unitCostUzs: Number(i.unitCostUzs),
  totalCostUzs: Number(i.totalCostUzs),
});

const parseTransfer = (raw: Raw): Transfer => ({
  ...(raw as unknown as Transfer),
  items: ((raw.items as Raw[]) ?? []).map(parseItem),
});

export interface TransferFilters {
  branchId?: string;
  status?: TransferStatus;
  from?: string;
  to?: string;
  limit?: number;
}

export interface CreateTransferPayload {
  fromBranchId?: string;
  toBranchId: string;
  items: { productId: string; quantity: number; unitCostUzs?: number }[];
  note?: string;
}

export const transferApi = {
  list: (params?: TransferFilters) =>
    apiClient.get('/transfers', { params }).then((r) =>
      (r.data.data as Raw[]).map(parseTransfer),
    ),

  getById: (id: string) =>
    apiClient.get(`/transfers/${id}`).then((r) => parseTransfer(r.data.data)),

  create: (payload: CreateTransferPayload) =>
    apiClient.post('/transfers', payload).then((r) => parseTransfer(r.data.data)),

  complete: (id: string) =>
    apiClient.post(`/transfers/${id}/complete`).then((r) => parseTransfer(r.data.data)),

  cancel: (id: string) =>
    apiClient.post(`/transfers/${id}/cancel`).then((r) => parseTransfer(r.data.data)),
};
