import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from '../config/routes';
import { isPlatformOwner, readPlatformToken, readPlatformUser } from '../shared/auth/session';

export const ProtectedRoute = () => {
  const location = useLocation();
  const token = readPlatformToken();
  const user = readPlatformUser();

  if (!token || !isPlatformOwner(user)) {
    const from = location.pathname === routes.dashboard ? '' : `?from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={`${routes.login}${from}`} replace />;
  }

  return <Outlet />;
};
