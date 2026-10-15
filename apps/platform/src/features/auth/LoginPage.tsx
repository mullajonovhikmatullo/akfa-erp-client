import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, ShieldAlert } from 'lucide-react';
import { PlatformSeekApi, readPlatformLoginAttempts } from '@store/platform-stub';
import { routes } from '../../config/routes';
import { platformQueryClient } from '../../app/providers/AppProviders';
import { loginPlatformOwner, savePlatformSession } from '../../shared/auth/session';
import { apiErrorMessage } from '../../shared/lib/apiError';
import { Button } from '../../shared/ui/button';
import { Field, Input, PasswordInput } from '../../shared/ui/form';
import { BrandMark } from '../../layouts/Sidebar';
import { AttemptDots, formatCountdown } from './view/AttemptDots';

const safeRedirect = (value: string | null) =>
  !value || !value.startsWith('/') || value.startsWith('//') || value === routes.login ? routes.home : value;

export function LoginPage() {
  //
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const redirectTo = useMemo(() => safeRedirect(searchParams.get('from')), [searchParams]);

  const attemptsFetch = PlatformSeekApi.fetch.findLoginAttempts();
  const attemptsQuery = useQuery({ ...attemptsFetch, retry: false, staleTime: 0 });
  const attempts = attemptsQuery.data;
  const unlockAt = attempts?.retryAfterSeconds ? attemptsQuery.dataUpdatedAt + attempts.retryAfterSeconds * 1000 : 0;
  const lockSecondsLeft = Math.max(0, Math.ceil((unlockAt - now) / 1000));
  const locked = lockSecondsLeft > 0;
  const { refetch } = attemptsQuery;

  useEffect(() => {
    //
    if (!unlockAt) return undefined;
    const timer = window.setInterval(() => {
      //
      const current = Date.now();
      setNow(current);
      if (current >= unlockAt) {
        window.clearInterval(timer);
        void refetch();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [refetch, unlockAt]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    //
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await loginPlatformOwner(username.trim(), password);
      await platformQueryClient.cancelQueries();
      platformQueryClient.clear();
      savePlatformSession(result);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      const nextAttempts = readPlatformLoginAttempts(loginError);
      setPassword('');
      if (nextAttempts) {
        platformQueryClient.setQueryData(attemptsFetch.queryKey, nextAttempts);
        setNow(Date.now());
        setError(nextAttempts.lockedUntil ? null : 'Login yoki parol noto‘g‘ri');
        return;
      }
      setError(loginError instanceof Error && !('response' in loginError)
        ? loginError.message
        : apiErrorMessage(loginError, 'Tizimga kirib bo‘lmadi'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="relative w-full max-w-sm animate-in">
        <BrandMark className="mb-8 justify-center" />
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <div className="mb-5 grid gap-1">
            <h1 className="text-lg font-semibold tracking-tight">Xush kelibsiz</h1>
            <p className="text-[13px] text-muted-foreground">Platform boshqaruviga kirish</p>
          </div>

          {locked ? (
            <div className="mb-4 flex gap-3 rounded-xl border border-danger/30 bg-danger/8 p-3 text-[13px]">
              <Lock className="mt-0.5 size-4 shrink-0 text-danger" />
              <div className="grid gap-0.5">
                <span className="font-medium text-danger">Kirish vaqtincha bloklandi</span>
                <span className="text-muted-foreground">
                  Qayta urinish <span className="tabular font-medium text-foreground">{formatCountdown(lockSecondsLeft)}</span> dan keyin ochiladi.
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="mb-4 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[13px]">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Login">
              {(id) => (
                <Input
                  id={id}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                  disabled={submitting || locked}
                />
              )}
            </Field>
            <Field label="Parol">
              {(id) => (
                <PasswordInput
                  id={id}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={submitting || locked}
                />
              )}
            </Field>
            <Button type="submit" variant="primary" className="mt-1 w-full" loading={submitting} disabled={locked}>
              {locked ? `Bloklangan · ${formatCountdown(lockSecondsLeft)}` : 'Kirish'}
              {!locked && !submitting ? <ArrowRight /> : null}
            </Button>
          </form>

          {attempts ? <AttemptDots attempts={attempts} locked={locked} /> : null}
        </div>
      </div>
    </main>
  );
}
