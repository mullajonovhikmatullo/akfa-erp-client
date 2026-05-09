import { apiClient } from '@/shared/api/client';
import type { Branch } from '@/shared/types/domain';

export const branchApi = {
  list: () => apiClient.get('/branches').then((r) => r.data.data as Branch[]),
};
