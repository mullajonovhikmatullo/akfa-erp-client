import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserFlowApi } from '@store/store-stub'
import type { LoginResponse } from '@store/store-stub'
import type { TFunc } from '../view/types'

interface UseAuthMutationOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
  onError: (error: unknown) => void
}

export function useAuthMutation({ t, onAuthenticated, onError }: UseAuthMutationOptions) {
  //
  return useMutation({
    mutationFn: UserFlowApi.login,
    onSuccess: (response) => {
      //
      onAuthenticated(response)
      toast.success(`${t('login.welcomeToast')}, ${response.user.name.split(' ')[0]}!`, { duration: 2200 })
    },
    onError,
  })
}
