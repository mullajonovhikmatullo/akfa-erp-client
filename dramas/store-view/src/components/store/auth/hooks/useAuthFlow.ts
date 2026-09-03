import { useCallback, useEffect, useRef, useState } from 'react'
import type { LoginResponse } from '@store/store-stub'
import { isTransientAuthError, readAndClearAuthFragment } from '../lib/auth-navigation'
import type { TFunc } from '../view/types'
import { useAuthMutation } from './useAuthMutation'

interface UseAuthFlowOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
}

export function useAuthFlow({ t, onAuthenticated }: UseAuthFlowOptions) {
  //
  const fragmentHandled = useRef(false)
  const [handoffCode, setHandoffCode] = useState<string | null>(null)
  const [handoffRetryable, setHandoffRetryable] = useState(false)
  const [setupCode, setSetupCode] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const { exchangeHandoff, completeAccountSetup } = useAuthMutation({
    t,
    onAuthenticated,
    onError: () => undefined,
  })

  const handleHandoffExchange = useCallback((code: string) => {
    //
    setAuthError(null)
    setHandoffRetryable(false)
    exchangeHandoff.mutate(
      { handoffCode: code },
      {
        onSuccess: onAuthenticated,
        onError: (error) => {
          //
          if (isTransientAuthError(error)) {
            setHandoffRetryable(true)
            setAuthError(t('login.linkTemporary'))
            return
          }
          setHandoffCode(null)
          setAuthError(t('login.linkInvalid'))
        },
      },
    )
  }, [exchangeHandoff, onAuthenticated, t])

  useEffect(() => {
    //
    if (fragmentHandled.current) return
    fragmentHandled.current = true

    const fragment = readAndClearAuthFragment()
    if (fragment.handoffCode && fragment.setupCode) {
      setAuthError(t('login.linkInvalid'))
      return
    }
    if (fragment.setupCode) {
      setSetupCode(fragment.setupCode)
      return
    }
    if (!fragment.handoffCode) return

    setHandoffCode(fragment.handoffCode)
    handleHandoffExchange(fragment.handoffCode)
  }, [handleHandoffExchange, t])

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
    exchangeHandoff,
    handleHandoffExchange,
    handoffCode,
    handoffRetryable,
    newPassword,
    setConfirmPassword,
    setNewPassword,
    setupCode,
    submitAccountSetup,
  }
}
