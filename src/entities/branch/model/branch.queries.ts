import { useQuery } from '@tanstack/react-query';
import { branchApi } from '../api/branch.api';

export const branchKeys = {
  all: ['branches'] as const,
  list: () => [...branchKeys.all, 'list'] as const,
};

export function useBranches() {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: branchApi.list,
    staleTime: 5 * 60 * 1000,
  });
}
