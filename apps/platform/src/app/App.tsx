import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from '../config/routes';
import { LoginPage } from '../features/auth/LoginPage';
import { CompaniesPage } from '../features/companies/CompaniesPage';
import { OverviewPage } from '../features/overview/OverviewPage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { PlansPage } from '../features/plans/PlansPage';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

export function App() {
  //
  return (
    <Routes>
      <Route path={routes.login} element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={routes.home} element={<OverviewPage />} />
          <Route path={routes.companies} element={<CompaniesPage />} />
          <Route path={routes.payments} element={<PaymentsPage />} />
          <Route path={routes.plans} element={<PlansPage />} />
          <Route path="/subscriptions/payments" element={<Navigate to={routes.payments} replace />} />
          <Route path="/subscriptions/plans" element={<Navigate to={routes.plans} replace />} />
          <Route path="/companies/*" element={<Navigate to={routes.companies} replace />} />
          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
