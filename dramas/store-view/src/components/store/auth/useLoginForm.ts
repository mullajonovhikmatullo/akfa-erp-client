import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LoginResponse } from '@store/store-stub'
import { createLoginSchema, type LoginFormValues } from './loginSchema'
import { useAuthMutation } from './hooks/useAuthMutation'
import type { TFunc } from './view/types'

interface UseLoginFormOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
  initialUsername?: string
  onBeforeSubmit?: (values: LoginFormValues) => void
}

export function useLoginForm({ t, onAuthenticated, initialUsername = '', onBeforeSubmit }: UseLoginFormOptions) {
  //
  const schema = useMemo(() => createLoginSchema(t), [t])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: initialUsername, password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const [googleLink, setGoogleLink] = useState<{ email: string; credential: string } | null>(null)

  const { login, loginWithGoogle } = useAuthMutation({
    t,
    onAuthenticated,
    onGoogleLinkRequired: (email, credential) => setGoogleLink({ email, credential }),
    onGoogleError: (error, payload) => {
      //
      const response = (error as { response?: { status?: number; data?: { message?: string } } }).response
      const invalidGoogleCredential = response?.data?.message === 'Invalid Google credential'
      if (response?.status === 401 && payload.account && !invalidGoogleCredential) {
        form.setError('root', { type: 'credentials', message: t('login.errorCredentials') })
        form.setError('username', { type: 'credentials', message: '' })
        form.setError('password', { type: 'credentials', message: '' })
        return
      }
      if (response?.status === 401) setGoogleLink(null)
      const message = response?.status === 409 ? t('login.googleLinkConflict')
        : response?.status === 403 || response?.status === 423 ? t('login.errorDisabled')
        : response?.status === 429 ? t('login.errorRateLimit')
        : response?.status === 401 ? t('login.googleExpired')
        : t('login.googleError')
      form.setError('root', { type: 'google', message })
    },
    onError: (error: unknown) => {
      //
      const httpError = error as { isAxiosError?: boolean; code?: string; response?: { status?: number } }
      const status = httpError.response?.status

      if (status === 401) {
        form.setError('root', {
          type: 'credentials',
          message: t('login.errorCredentials'),
        })
        form.setError('username', { type: 'credentials', message: '' })
        form.setError('password', { type: 'credentials', message: '' })
        return
      }

      if (status === 403 || status === 423) {
        form.setError('root', {
          type: 'disabled',
          message: t('login.errorDisabled'),
        })
        return
      }

      if (status === 429) {
        form.setError('root', {
          type: 'rate-limit',
          message: t('login.errorRateLimit'),
        })
        return
      }

      if (status === 408 || status === 504 || httpError.code === 'ECONNABORTED' || httpError.code === 'ETIMEDOUT') {
        form.setError('root', {
          type: 'timeout',
          message: t('login.errorTimeout'),
        })
        return
      }

      if (httpError.isAxiosError && !httpError.response) {
        form.setError('root', {
          type: 'network',
          message: t('login.errorNetwork'),
        })
        return
      }

      if (status && status >= 500) {
        form.setError('root', {
          type: 'server',
          message: t('login.errorServer'),
        })
        return
      }

      form.setError('root', {
        type: status ? 'request' : 'unknown',
        message: t(status ? 'login.errorRequest' : 'login.errorServer'),
      })
    },
  })
  const isPending = login.isPending || loginWithGoogle.isPending
  const mutateGoogle = loginWithGoogle.mutate

  useEffect(() => {
    //
    if (googleLink && !isPending) form.setFocus('username')
  }, [googleLink, form, isPending])

  const handleGoogleCredential = useCallback((credential: string) => {
    //
    if (isPending) return
    form.clearErrors()
    setGoogleLink(null)
    mutateGoogle({ credential })
  }, [form, isPending, mutateGoogle])

  const cancelGoogleLink = () => {
    //
    setGoogleLink(null)
    form.clearErrors()
  }

  const onSubmit = form.handleSubmit((values) => {
    //
    if (isPending) return
    form.clearErrors('root')
    onBeforeSubmit?.(values)
    if (googleLink) loginWithGoogle.mutate({ credential: googleLink.credential, account: values })
    else login.mutate(values)
  })

  const clearCredentialErrors = () => {
    //
    if (form.formState.errors.root?.type === 'credentials') {
      form.clearErrors('root')
      form.clearErrors('username')
      form.clearErrors('password')
    }
  }

  return {
    form,
    onSubmit,
    isLoading: isPending,
    clearCredentialErrors,
    googleLinkEmail: googleLink?.email ?? null,
    cancelGoogleLink,
    handleGoogleCredential,
    isGooglePending: loginWithGoogle.isPending,
  }
}
