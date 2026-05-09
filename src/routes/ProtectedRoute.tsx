import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import { tokenStore } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const location = useLocation();

  // Wait for Zustand persist to rehydrate before deciding
  if (!isHydrated) return null;

  // Redirect if Zustand user is gone OR the token itself is missing/cleared
  const hasToken = Boolean(tokenStore.get());
  if (!user || !hasToken) {
    // Don't add ?from for root path — that's the default after login anyway
    const isRoot = location.pathname === '/' || location.pathname === ROUTES.DASHBOARD;
    const from = isRoot ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${ROUTES.LOGIN}${from}`} replace />;
  }

  return <Outlet />;
}
