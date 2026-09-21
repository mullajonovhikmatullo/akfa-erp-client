import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isSessionInvalidError, useAuthStore, useSessionDetail } from '@/entities/user';
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
  const sessionInvalid = isSessionInvalidError(verification.error);

  useEffect(() => {
    if (verification.data) setUser(verification.data);
  }, [setUser, verification.data]);

  useEffect(() => {
    //
    if (shouldVerify && sessionInvalid) logout(sessionToken);
  }, [logout, sessionInvalid, sessionToken, shouldVerify]);

  if (!isHydrated) return null;

  if (!user || !hasToken || sessionInvalid) {
    const noFromPaths = ['/', ROUTES.DASHBOARD, ROUTES.PROFILE];
    const from = noFromPaths.includes(location.pathname) ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${ROUTES.LOGIN}${from}`} replace />;
  }

  if (verification.isPending) return null;

  return <Outlet />;
}
