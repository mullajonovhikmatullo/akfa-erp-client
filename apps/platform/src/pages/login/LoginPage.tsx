import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Input } from 'antd';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '../../config/routes';
import {
  loginPlatformOwner,
  savePlatformSession,
} from '../../shared/auth/session';
import { platformQueryClient } from '../../app/providers/AppProviders';

type LoginFormState = {
  username: string;
  password: string;
};

const initialForm: LoginFormState = {
  username: '',
  password: '',
};

const normalizeRedirect = (value: string | null) => {
  //
  if (!value || !value.startsWith('/') || value.startsWith('//') || value === routes.login) {
    return routes.dashboard;
  }

  return value;
};

export const LoginPage = () => {
  //
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<LoginFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useMemo(() => normalizeRedirect(searchParams.get('from')), [searchParams]);

  const updateField = (key: keyof LoginFormState, value: string) => {
    //
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    //
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await loginPlatformOwner(form.username.trim(), form.password);
      await platformQueryClient.cancelQueries();
      platformQueryClient.clear();
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
            <i className="icons-building icon-size-24" />
          </span>
          <div>
            <span>Store Management</span>
            <strong>Platform admin</strong>
          </div>
        </div>

        <div className="platform-login__heading">
          <span>
            <i className="icons-user_check icon-size-16" aria-hidden="true" />
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
              prefix={<i className="icons-user-circle icon-size-18" />}
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
              prefix={<i className="icons-lock icon-size-18" />}
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
