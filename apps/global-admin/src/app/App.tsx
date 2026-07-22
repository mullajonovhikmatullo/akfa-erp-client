import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from '../config/routes';
import { AppLayout } from '../layouts/AppLayout';
import { ComingSoonPage } from '../pages/ComingSoonPage';
import { DashboardPage } from '../pages/DashboardPage';

export const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path={routes.home} element={<Navigate to={routes.dashboard} replace />} />
      <Route path={routes.dashboard} element={<DashboardPage />} />
      <Route path="*" element={<ComingSoonPage />} />
    </Route>
  </Routes>
);
