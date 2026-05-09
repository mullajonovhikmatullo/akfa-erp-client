import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';

export function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [searchParams] = useSearchParams();

  if (!isHydrated) return null;

  if (user) {
    const destination = searchParams.get('from') ?? ROUTES.DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="auth-shell">
      <Outlet />
    </div>
  );
}
