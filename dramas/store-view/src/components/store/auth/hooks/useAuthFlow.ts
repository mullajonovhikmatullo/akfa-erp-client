import { useCallback, useEffect, useRef, useState } from 'react'
import type { LoginResponse } from '@store/store-stub'
import { readAndClearSetupCode } from '../lib/auth-navigation'
import type { TFunc } from '../view/types'
import { useAuthMutation } from './useAuthMutation'

interface UseAuthFlowOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
}

export function useAuthFlow({ t, onAuthenticated }: UseAuthFlowOptions) {
  //
  const fragmentHandled = useRef(false)
  const [setupCode, setSetupCode] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const { completeAccountSetup } = useAuthMutation({
    t,
    onAuthenticated,
    onError: () => undefined,
  })

  useEffect(() => {
    //
    if (fragmentHandled.current) return
    fragmentHandled.current = true

    const code = readAndClearSetupCode()
    if (code) setSetupCode(code)
  }, [])

  const submitAccountSetup = useCallback(() => {
    //
    setAuthError(null)
    if (newPassword.length < 6) {
      setAuthError(t('login.passwordMin6'))
      return
    }
    if (newPassword !== confirmPassword) {
      setAuthError(t('login.passwordMismatch'))
      return
    }
    if (!setupCode) return

    completeAccountSetup.mutate(
      { setupCode, newPassword, confirmPassword },
      {
        onSuccess: onAuthenticated,
        onError: () => setAuthError(t('login.setupInvalid')),
      },
    )
  }, [completeAccountSetup, confirmPassword, newPassword, onAuthenticated, setupCode, t])

  return {
    authError,
    completeAccountSetup,
    confirmPassword,
    newPassword,
    setConfirmPassword,
    setNewPassword,
    setupCode,
    submitAccountSetup,
  }
}
