import { apiClient } from '@/shared/api/client';
import type { Branch } from '@/shared/types/domain';

export interface BranchPayload {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface BranchPage {
  items: Branch[];
  total: number;
}

export const branchApi = {
  list: () =>
    apiClient.get('/branches').then((r) => {
      const body = r.data;
      return (Array.isArray(body) ? body : body.data) as Branch[];
    }),

  listPaginated: (params: { page: number; pageSize: number }) =>
    apiClient
      .get<BranchPage>('/branches', { params })
      .then((r) => r.data),
  create: (data: BranchPayload) =>
    apiClient.post('/branches', data).then((r) => {
      const body = r.data;
      return (body.data ?? body) as Branch;
    }),
  update: (id: string, data: Partial<BranchPayload>) =>
    apiClient.patch(`/branches/${id}`, data).then((r) => {
      const body = r.data;
      return (body.data ?? body) as Branch;
    }),
  delete: (id: string) => apiClient.delete(`/branches/${id}`),
};
