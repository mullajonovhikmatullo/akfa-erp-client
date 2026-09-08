import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, useSessionDetail } from '@/entities/user';
import { tokenStore } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';

export function ProtectedRoute() {
  //
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const sessionToken = tokenStore.get();
  const hasToken = Boolean(sessionToken);
  const shouldVerify = isHydrated && Boolean(user) && hasToken;
  const verification = useSessionDetail(user?.id, shouldVerify);

  useEffect(() => {
    if (verification.data) setUser(verification.data);
  }, [setUser, verification.data]);

  useEffect(() => {
    //
    if (shouldVerify && verification.isError) logout(sessionToken);
  }, [logout, sessionToken, shouldVerify, verification.isError]);

  if (!isHydrated) return null;

  if (!user || !hasToken || verification.isError) {
    const noFromPaths = ['/', ROUTES.DASHBOARD, ROUTES.PROFILE];
    const from = noFromPaths.includes(location.pathname) ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${ROUTES.LOGIN}${from}`} replace />;
  }

  if (verification.isPending) return null;

  return <Outlet />;
}
