import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserFlowApi } from '@store/store-stub'
import type { LoginResponse } from '@store/store-stub'
import { createLoginSchema, type LoginFormValues } from './loginSchema'

type TFunc = (key: string) => string

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

  const { mutate, isPending } = useMutation({
    mutationFn: UserFlowApi.login,
    onSuccess: (response) => {
      //
      onAuthenticated(response)
      toast.success(`${t('login.welcomeToast')}, ${response.user.name.split(' ')[0]}!`, { duration: 2200 })
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

  const onSubmit = form.handleSubmit((values) => {
    //
    form.clearErrors('root')
    onBeforeSubmit?.(values)
    mutate(values)
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
  }
}
