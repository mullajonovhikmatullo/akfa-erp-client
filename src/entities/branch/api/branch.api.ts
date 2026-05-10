import { apiClient } from '@/shared/api/client';
import type { Branch } from '@/shared/types/domain';

export interface BranchPayload {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export const branchApi = {
  list: () =>
    apiClient.get('/branches').then((r) => {
      const body = r.data;
      return (Array.isArray(body) ? body : body.data) as Branch[];
    }),
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
