import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';

export function AuthLayout() {
  //
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [searchParams] = useSearchParams();
  const [accountEntry] = useState(() => {
    //
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    return fragment.has('handoff') || fragment.has('setup');
  });

  if (!isHydrated) return null;

  if (user && !accountEntry) {
    const destination = searchParams.get('from') ?? ROUTES.DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="auth-shell">
      <Outlet />
    </div>
  );
}
