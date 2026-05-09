import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/entities/user';
import { userApi } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { loginSchema, type LoginFormValues } from '../validation/loginSchema';

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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
      toast.success(`Xush kelibsiz, ${user.name.split(' ')[0]}!`);
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message: string = error.response?.data?.message ?? '';

        if (status === 401) {
          form.setError('root', {
            type: 'credentials',
            message: 'Username yoki parol noto\'g\'ri.',
          });
          // Highlight both fields without extra text under them
          form.setError('username', { type: 'credentials', message: '' });
          form.setError('password', { type: 'credentials', message: '' });
        } else if (status === 403) {
          form.setError('root', {
            type: 'disabled',
            message: 'Hisobingiz bloklangan. Administrator bilan bog\'laning.',
          });
        } else if (!error.response) {
          form.setError('root', {
            type: 'network',
            message: 'Server bilan bog\'lanib bo\'lmadi. Internet aloqangizni tekshiring.',
          });
        } else {
          form.setError('root', {
            type: 'server',
            message: message || 'Kutilmagan xato yuz berdi. Qaytadan urinib ko\'ring.',
          });
        }
      } else {
        form.setError('root', {
          type: 'unknown',
          message: 'Kutilmagan xato yuz berdi. Qaytadan urinib ko\'ring.',
        });
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root');
    mutate(values);
  });

  // Clear root + field credential errors as soon as user edits an input
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
