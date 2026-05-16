import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { useAuthStore } from './auth.store';
import type { CreateAdminPayload, UpdateAdminPayload, UpdateProfilePayload, ChangePasswordPayload } from '../api/user.api';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.list,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => userApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminPayload }) =>
      userApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useAssignBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, branchId }: { userId: string; branchId: string | null }) =>
      userApi.assignBranch(userId, branchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      if (updatedUser) setUser(updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userApi.changePassword(payload),
  });
}
