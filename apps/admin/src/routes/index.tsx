import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ROUTES } from '@/shared/config/routes';
import {
  DashboardPage,
  ProductsPage,
  CustomersPage,
  SalesPage,
  PurchasesPage,
  ExpensesPage,
  TransfersPage,
  AnalyticsPage,
  SettingsPage,
  LoginPage,
  BranchesPage,
  AdminsPage,
  CategoriesPage,
  ProfilePage,
} from './LazyRoutes';

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
);

// Layouts are imported directly (not lazy) because they render on every route
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

export function AppRouter() {
  //
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
              <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
              <Route path={ROUTES.SALES} element={<SalesPage />} />
              <Route path={ROUTES.PURCHASES} element={<PurchasesPage />} />
              <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />
              <Route path={ROUTES.TRANSFERS} element={<TransfersPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

              {/* Super admin only */}
              <Route element={<RoleRoute permission="analytics:global" />}>
                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
              </Route>
              <Route element={<RoleRoute permission="branch:create" />}>
                <Route path={ROUTES.BRANCHES} element={<BranchesPage />} />
              </Route>
              <Route element={<RoleRoute permission="admin:create" />}>
                <Route path={ROUTES.ADMINS} element={<AdminsPage />} />
              </Route>
              <Route element={<RoleRoute permission="category:manage" />}>
                <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
