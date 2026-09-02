import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserFlowApi } from '@store/store-stub'
import type {
  ChangePasswordPayload,
  CreateAdminPayload,
  UpdateAdminPayload,
  UpdateProfilePayload,
  UpdateProfilePhotoPayload,
  User,
} from '@store/store-stub'
import { userKeys } from './userKeys'

interface UserMutationOptions {
  onUpdated?: (user: User) => void
}

export function useUserMutation({ onUpdated }: UserMutationOptions = {}) {
  //
  const queryClient = useQueryClient()
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: userKeys.all })

  const createAdmin = useMutation({
    mutationFn: (payload: CreateAdminPayload) => UserFlowApi.createAdmin(payload),
    onSuccess: invalidateUsers,
  })

  const updateAdmin = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminPayload }) => UserFlowApi.updateAdmin({ id, data }),
    onSuccess: invalidateUsers,
  })

  const deleteAdmin = useMutation({
    mutationFn: UserFlowApi.deleteAdmin,
    onSuccess: invalidateUsers,
  })

  const assignBranch = useMutation({
    mutationFn: ({ userId, branchId }: { userId: string; branchId: string | null }) =>
      UserFlowApi.assignBranch({ userId, branchId }),
    onSuccess: invalidateUsers,
  })

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => UserFlowApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      //
      if (updatedUser) onUpdated?.(updatedUser)
    },
  })

  const updateProfilePhoto = useMutation({
    mutationFn: (payload: UpdateProfilePhotoPayload) => UserFlowApi.updateProfilePhoto(payload),
    onSuccess: (updatedUser) => onUpdated?.(updatedUser),
  })

  const deleteProfilePhoto = useMutation({
    mutationFn: () => UserFlowApi.deleteProfilePhoto(),
    onSuccess: (updatedUser) => onUpdated?.(updatedUser),
  })

  const changePassword = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => UserFlowApi.changePassword(payload),
  })

  return {
    createAdmin,
    updateAdmin,
    deleteAdmin,
    assignBranch,
    updateProfile,
    updateProfilePhoto,
    deleteProfilePhoto,
    changePassword,
  }
}
