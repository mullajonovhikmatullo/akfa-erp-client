import { useNavigate } from 'react-router-dom';
import { routes } from '../config/routes';
import { platformQueryClient } from '../app/providers/AppProviders';
import { clearPlatformSession } from '../shared/auth/session';

export function useSignOut() {
  //
  const navigate = useNavigate();
  return async () => {
    //
    await platformQueryClient.cancelQueries();
    platformQueryClient.clear();
    clearPlatformSession();
    navigate(routes.login, { replace: true });
  };
}
