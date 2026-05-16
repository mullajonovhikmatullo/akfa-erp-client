import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/entities/user';
import { userApi } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { createLoginSchema, type LoginFormValues } from '../validation/loginSchema';
import { useT } from '@/shared/lib/i18n';

export function useLoginForm() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: userApi.login,
    onSuccess: ({ user, accessToken }) => {
      login(user, accessToken);
      const from = searchParams.get('from') ?? ROUTES.DASHBOARD;
      navigate(from, { replace: true });
      toast.success(`${t('login.welcomeToast')}, ${user.name.split(' ')[0]}!`);
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message: string = error.response?.data?.message ?? '';

        if (status === 401) {
          form.setError('root', {
            type: 'credentials',
            message: t('login.errorCredentials'),
          });
          form.setError('username', { type: 'credentials', message: '' });
          form.setError('password', { type: 'credentials', message: '' });
        } else if (status === 403) {
          form.setError('root', {
            type: 'disabled',
            message: t('login.errorDisabled'),
          });
        } else if (!error.response) {
          form.setError('root', {
            type: 'network',
            message: t('login.errorNetwork'),
          });
        } else {
          form.setError('root', {
            type: 'server',
            message: message || t('login.errorServer'),
          });
        }
      } else {
        form.setError('root', {
          type: 'unknown',
          message: t('login.errorServer'),
        });
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root');
    mutate(values);
  });

  const clearCredentialErrors = () => {
    if (form.formState.errors.root?.type === 'credentials') {
      form.clearErrors('root');
      form.clearErrors('username');
      form.clearErrors('password');
    }
  };

  return {
    form,
    onSubmit,
    isLoading: isPending,
    clearCredentialErrors,
    sessionExpired: searchParams.get('reason') === 'expired',
  };
}
