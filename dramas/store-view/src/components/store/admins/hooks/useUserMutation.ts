import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserFlowApi } from '@store/store-stub'
import type { User } from '@store/store-stub'
import { userKeys } from './userKeys'

interface UserMutationOptions {
  onUpdated?: (user: User) => void
}

export function useUserMutation({ onUpdated }: UserMutationOptions = {}) {
  //
  const queryClient = useQueryClient()
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: userKeys.all })
  const handleUserUpdated = (updatedUser: User) => {
    //
    void invalidateUsers()
    onUpdated?.(updatedUser)
  }

  const createAdmin = useMutation({
    mutationFn: UserFlowApi.createAdmin,
    onSuccess: invalidateUsers,
  })

  const updateAdmin = useMutation({
    mutationFn: UserFlowApi.updateAdmin,
    onSuccess: invalidateUsers,
  })

  const deleteAdmin = useMutation({
    mutationFn: UserFlowApi.deleteAdmin,
    onSuccess: invalidateUsers,
  })

  const assignBranch = useMutation({
    mutationFn: UserFlowApi.assignBranch,
    onSuccess: invalidateUsers,
  })

  const updateProfile = useMutation({
    mutationFn: UserFlowApi.updateProfile,
    onSuccess: handleUserUpdated,
  })

  const updateProfilePhoto = useMutation({
    mutationFn: UserFlowApi.updateProfilePhoto,
    onSuccess: handleUserUpdated,
  })

  const deleteProfilePhoto = useMutation({
    mutationFn: UserFlowApi.deleteProfilePhoto,
    onSuccess: handleUserUpdated,
  })

  const changePassword = useMutation({
    mutationFn: UserFlowApi.changePassword,
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
