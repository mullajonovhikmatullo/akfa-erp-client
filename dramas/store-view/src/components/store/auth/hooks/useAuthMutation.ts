import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserFlowApi, type GoogleLoginPayload, type LoginResponse } from '@store/store-stub'
import type { TFunc } from '../view/types'

interface UseAuthMutationOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
  onError: (error: unknown) => void
  onGoogleError?: (error: unknown, payload: GoogleLoginPayload) => void
  onGoogleLinkRequired?: (email: string, credential: string) => void
}

export function useAuthMutation({ t, onAuthenticated, onError, onGoogleError, onGoogleLinkRequired }: UseAuthMutationOptions) {
  //
  const handleAuthenticated = (response: LoginResponse) => {
    //
    onAuthenticated(response)
    toast.success(`${t('login.welcomeToast')}, ${response.user.name.split(' ')[0]}!`, { duration: 2200 })
  }
  const login = useMutation({
    mutationFn: UserFlowApi.login,
    onSuccess: handleAuthenticated,
    onError,
  })
  const loginWithGoogle = useMutation({
    mutationFn: UserFlowApi.loginWithGoogle,
    onSuccess: (response, payload) => {
      //
      if (response.status === 'authenticated') handleAuthenticated(response.session)
      else onGoogleLinkRequired?.(response.email, payload.credential)
    },
    onError: (error, payload) => onGoogleError ? onGoogleError(error, payload) : onError(error),
  })
  const exchangeHandoff = useMutation({ mutationFn: UserFlowApi.exchangeHandoff })
  const completeAccountSetup = useMutation({ mutationFn: UserFlowApi.completeAccountSetup })

  return { login, loginWithGoogle, exchangeHandoff, completeAccountSetup }
}
