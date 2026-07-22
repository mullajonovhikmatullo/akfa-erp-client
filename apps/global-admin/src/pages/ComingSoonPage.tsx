import { useLocation, useNavigate } from 'react-router-dom';
import { ComingSoonView } from '@erp/global-admin-view/coming-soon';
import { routes } from '../config/routes';

export const ComingSoonPage = () => {
  //
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ComingSoonView
      isSupportRequests={location.pathname === '/support-requests'}
      onBack={() => navigate(routes.dashboard)}
    />
  );
};
