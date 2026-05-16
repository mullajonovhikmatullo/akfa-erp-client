import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../api/branch.api';
import type { BranchPayload } from '../api/branch.api';

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

export function useBranchesPage(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...branchKeys.list(), 'paginated', page, pageSize] as const,
    queryFn: () => branchApi.listPaginated({ page, pageSize }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: branchApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BranchPayload> }) =>
      branchApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: branchApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}
