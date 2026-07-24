import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Input } from 'antd';
import { Lock, ShieldCheck, Storefront, UserCircle } from '@phosphor-icons/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '../../config/routes';
import {
  isPlatformOwner,
  loginPlatformOwner,
  readPlatformToken,
  readPlatformUser,
  savePlatformSession,
} from '../../shared/auth/session';

type LoginFormState = {
  username: string;
  password: string;
};

const initialForm: LoginFormState = {
  username: '',
  password: '',
};

const normalizeRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value === routes.login) {
    return routes.dashboard;
  }

  return value;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<LoginFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(() => normalizeRedirect(searchParams.get('from')), [searchParams]);

  useEffect(() => {
    if (readPlatformToken() && isPlatformOwner(readPlatformUser())) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const updateField = (key: keyof LoginFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await loginPlatformOwner(form.username.trim(), form.password);
      savePlatformSession(result);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Tizimga kirib bo‘lmadi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="platform-login">
      <section className="platform-login__panel" aria-labelledby="platform-login-title">
        <div className="platform-login__brand">
          <span className="platform-login__mark" aria-hidden="true">
            <Storefront size={24} weight="duotone" />
          </span>
          <div>
            <span>Store Management</span>
            <strong>Platform admin</strong>
          </div>
        </div>

        <div className="platform-login__heading">
          <span>
            <ShieldCheck size={16} weight="fill" aria-hidden="true" />
            Platform owner
          </span>
          <h1 id="platform-login-title">Platform admin paneliga kirish</h1>
        </div>

        {error && <Alert type="error" showIcon message={error} />}

        <form className="platform-login__form" onSubmit={handleSubmit}>
          <label>
            <span>Login</span>
            <Input
              size="large"
              prefix={<UserCircle size={18} weight="duotone" />}
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              autoComplete="username"
              disabled={isSubmitting}
              required
              autoFocus
            />
          </label>

          <label>
            <span>Parol</span>
            <Input.Password
              size="large"
              prefix={<Lock size={18} weight="duotone" />}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </label>

          <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
            Kirish
          </Button>
        </form>
      </section>
    </main>
  );
};
