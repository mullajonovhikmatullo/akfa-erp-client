import { useLocation, useNavigate } from 'react-router-dom';
import { ComingSoonView } from '@store/platform-view/coming-soon';
import { routes } from '../../config/routes';

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
