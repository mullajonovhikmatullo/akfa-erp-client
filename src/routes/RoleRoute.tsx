import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/entities/user';
import type { Permission } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';

interface RoleRouteProps {
  permission: Permission;
  redirectTo?: string;
}

export function RoleRoute({ permission, redirectTo = ROUTES.DASHBOARD }: RoleRouteProps) {
  const checkCan = useAuthStore((s) => s.can);

  if (!checkCan(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
