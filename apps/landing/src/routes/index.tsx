import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@erp/landing-view';
import { routes } from '../config/routes';

export const AppRouter = () => (
  <Routes>
    <Route path={routes.home} element={<LandingPage />} />
    <Route path="*" element={<Navigate to={routes.home} replace />} />
  </Routes>
);
