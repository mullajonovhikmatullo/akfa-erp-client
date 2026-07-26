import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PlatformSeekApi } from '@store/platform-stub';
import { routes } from '../config/routes';
import {
  clearPlatformSession,
  isPlatformOwner,
  readPlatformToken,
  savePlatformUser,
} from '../shared/auth/session';
import { platformQueryClient } from '../app/providers/AppProviders';

export const ProtectedRoute = () => {
  const location = useLocation();
  const token = readPlatformToken();
  const sessionQuery = useQuery({
    queryKey: ['platform-session'],
    queryFn: PlatformSeekApi.me,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (sessionQuery.data && isPlatformOwner(sessionQuery.data)) {
      savePlatformUser(sessionQuery.data);
    }
  }, [sessionQuery.data]);

  useEffect(() => {
    if (token && !sessionQuery.isPending && (sessionQuery.isError || !isPlatformOwner(sessionQuery.data ?? null))) {
      platformQueryClient.clear();
      clearPlatformSession();
    }
  }, [sessionQuery.data, sessionQuery.isError, sessionQuery.isPending, token]);

  if (!token) {
    const from = location.pathname === routes.dashboard ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${routes.login}${from}`} replace />;
  }

  if (sessionQuery.isPending) return null;

  if (sessionQuery.isError || !isPlatformOwner(sessionQuery.data ?? null)) {
    const from = location.pathname === routes.dashboard ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${routes.login}${from}`} replace />;
  }

  return <Outlet />;
};
