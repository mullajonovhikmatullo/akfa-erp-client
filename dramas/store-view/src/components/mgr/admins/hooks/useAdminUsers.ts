import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserFlowApi, UserSeekApi } from '@store/store-stub'
import type { ChangePasswordPayload, CreateAdminPayload, UpdateAdminPayload, UpdateProfilePayload, User } from '@store/store-stub'

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export function useUsers() {
  //
  const { queryKey, queryFn } = UserSeekApi.fetch.findUsers()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminsPage(page: number, pageSize: number) {
  //
  const { queryKey, queryFn } = UserSeekApi.fetch.findAdminsPage({ page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateAdmin() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => UserFlowApi.createAdmin(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateAdmin() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminPayload }) => UserFlowApi.updateAdmin({ id, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useDeleteAdmin() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: UserFlowApi.deleteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useAssignBranch() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, branchId }: { userId: string; branchId: string | null }) =>
      UserFlowApi.assignBranch({ userId, branchId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateProfile(onUpdated?: (user: User) => void) {
  //
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => UserFlowApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      //
      if (updatedUser) onUpdated?.(updatedUser)
    },
  })
}

export function useChangePassword() {
  //
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => UserFlowApi.changePassword(payload),
  })
}
