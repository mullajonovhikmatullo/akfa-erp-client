import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserFlowApi } from '@store/store-stub';
import { queryClient } from '@/app/providers';
import { useAuthStore } from '@/entities/user';
import { tokenStore } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';

export function ProtectedRoute() {
  //
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const hasToken = Boolean(tokenStore.get());
  const shouldVerify = isHydrated && Boolean(user) && hasToken;
  const verification = useQuery({
    queryKey: ['auth', 'me', user?.id],
    queryFn: UserFlowApi.me,
    enabled: shouldVerify,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (verification.data) setUser(verification.data);
  }, [setUser, verification.data]);

  useEffect(() => {
    if (shouldVerify && verification.isError) {
      void queryClient.cancelQueries().finally(() => {
        queryClient.clear();
        logout();
      });
    }
  }, [logout, shouldVerify, verification.isError]);

  if (!isHydrated) return null;

  if (!user || !hasToken || verification.isError) {
    const noFromPaths = ['/', ROUTES.DASHBOARD, ROUTES.PROFILE];
    const from = noFromPaths.includes(location.pathname) ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${ROUTES.LOGIN}${from}`} replace />;
  }

  if (verification.isPending) return null;

  return <Outlet />;
}
