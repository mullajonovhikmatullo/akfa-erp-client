import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserFlowApi } from '@erp/store-buddy-stub'
import type { LoginResponse } from '@erp/store-buddy-stub'
import { createLoginSchema, type LoginFormValues } from './loginSchema'

type TFunc = (key: string) => string

interface UseLoginFormOptions {
  t: TFunc
  onAuthenticated: (response: LoginResponse) => void
}

export function useLoginForm({ t, onAuthenticated }: UseLoginFormOptions) {
  //
  const schema = useMemo(() => createLoginSchema(t), [t])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: UserFlowApi.login,
    onSuccess: (response) => {
      //
      onAuthenticated(response)
      toast.success(`${t('login.welcomeToast')}, ${response.user.name.split(' ')[0]}!`)
    },
    onError: (error: unknown) => {
      //
      const httpError = error as { isAxiosError?: boolean; response?: { status?: number; data?: { message?: string } } }
      const status = httpError.response?.status
      const message = httpError.response?.data?.message ?? ''

      if (status === 401) {
        form.setError('root', {
          type: 'credentials',
          message: t('login.errorCredentials'),
        })
        form.setError('username', { type: 'credentials', message: '' })
        form.setError('password', { type: 'credentials', message: '' })
        return
      }

      if (status === 403) {
        form.setError('root', {
          type: 'disabled',
          message: t('login.errorDisabled'),
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

      form.setError('root', {
        type: status ? 'server' : 'unknown',
        message: message || t('login.errorServer'),
      })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    //
    form.clearErrors('root')
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
