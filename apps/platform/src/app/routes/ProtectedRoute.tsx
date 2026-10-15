import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { PlatformSeekApi } from '@store/platform-stub';
import { routes } from '../../config/routes';
import { clearPlatformSession, isPlatformOwner, readPlatformToken, savePlatformUser } from '../../shared/auth/session';
import { platformQueryClient } from '../providers/AppProviders';

export function ProtectedRoute() {
  //
  const location = useLocation();
  const token = readPlatformToken();
  const sessionQuery = useQuery({
    queryKey: ['platform-session'],
    queryFn: PlatformSeekApi.me,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  });
  const signedIn = Boolean(token) && isPlatformOwner(sessionQuery.data ?? null);

  useEffect(() => {
    //
    if (sessionQuery.data && isPlatformOwner(sessionQuery.data)) savePlatformUser(sessionQuery.data);
  }, [sessionQuery.data]);

  useEffect(() => {
    //
    if (token && !sessionQuery.isPending && !signedIn) {
      platformQueryClient.clear();
      clearPlatformSession();
    }
  }, [sessionQuery.isPending, signedIn, token]);

  if (token && sessionQuery.isPending) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
      </div>
    );
  }

  if (!signedIn) {
    const from = location.pathname === routes.home ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${routes.login}${from}`} replace />;
  }

  return <Outlet />;
}
