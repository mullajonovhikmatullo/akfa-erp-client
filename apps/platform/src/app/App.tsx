import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from '../config/routes';
import { AppLayout } from '../layouts/AppLayout';
import { CompaniesPage, ComingSoonPage, DashboardPage, LoginPage, PaymentsPage } from '../pages';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export const App = () => (
  <Routes>
    <Route path={routes.login} element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path={routes.home} element={<Navigate to={routes.dashboard} replace />} />
        <Route path={routes.dashboard} element={<DashboardPage />} />
        <Route path={routes.companies} element={<CompaniesPage />} />
        <Route path={routes.companiesActive} element={<CompaniesPage initialStatus="ACTIVE" title="Faol mijozlar" />} />
        <Route
          path={routes.companiesBlocked}
          element={<CompaniesPage initialStatus="SUSPENDED" title="Bloklangan mijozlar" />}
        />
        <Route path={routes.subscriptionPayments} element={<PaymentsPage />} />
        <Route
          path={routes.subscriptionDebts}
          element={<CompaniesPage initialStatus="PAST_DUE" title="Qarzdorliklar" />}
        />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Route>
  </Routes>
);
