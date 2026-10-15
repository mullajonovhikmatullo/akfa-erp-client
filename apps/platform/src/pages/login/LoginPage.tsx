import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PlatformSeekApi, readPlatformLoginAttempts } from '@store/platform-stub';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '../../config/routes';
import {
  loginPlatformOwner,
  savePlatformSession,
} from '../../shared/auth/session';
import { platformQueryClient } from '../../app/providers/AppProviders';
import { formatLockCountdown, LoginAttemptsNotice } from './LoginAttemptsNotice';

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

  const loginAttempts = PlatformSeekApi.fetch.findLoginAttempts();
  const attemptsQuery = useQuery({ ...loginAttempts, retry: false, staleTime: 0 });
  const attempts = attemptsQuery.data;
  const unlockAt = attempts?.retryAfterSeconds ? attemptsQuery.dataUpdatedAt + attempts.retryAfterSeconds * 1000 : 0;
  const [now, setNow] = useState(() => Date.now());
  const lockSecondsLeft = Math.max(0, Math.ceil((unlockAt - now) / 1000));
  const isLocked = lockSecondsLeft > 0;
  const { refetch: refetchAttempts } = attemptsQuery;

  const redirectTo = useMemo(() => normalizeRedirect(searchParams.get('from')), [searchParams]);

  useEffect(() => {
    //
    if (!unlockAt) return undefined;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      //
      const current = Date.now();
      setNow(current);
      if (current < unlockAt) return;
      window.clearInterval(timer);
      void refetchAttempts();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [unlockAt, refetchAttempts]);

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
      const nextAttempts = readPlatformLoginAttempts(loginError);
      if (nextAttempts) {
        platformQueryClient.setQueryData(loginAttempts.queryKey, nextAttempts);
        return;
      }
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
        <LoginAttemptsNotice attempts={attempts} lockSecondsLeft={lockSecondsLeft} />

        <form className="platform-login__form" onSubmit={handleSubmit}>
          <label>
            <span>Login</span>
            <Input
              size="large"
              prefix={<i className="icons-user-circle icon-size-18" />}
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              autoComplete="username"
              disabled={isSubmitting || isLocked}
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
              disabled={isSubmitting || isLocked}
              required
            />
          </label>

          <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting} disabled={isLocked}>
            {isLocked ? `Bloklangan (${formatLockCountdown(lockSecondsLeft)})` : 'Kirish'}
          </Button>
        </form>
      </section>
    </main>
  );
};
