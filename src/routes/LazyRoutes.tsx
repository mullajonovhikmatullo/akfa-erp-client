import { lazy } from 'react';

// Each page is lazy-loaded — only downloaded when the user navigates to it.
// Vite automatically creates separate chunks per lazy import.

export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

export const ProductsPage = lazy(() =>
  import('@/pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);

export const CustomersPage = lazy(() =>
  import('@/pages/customers/CustomersPage').then((m) => ({ default: m.CustomersPage })),
);

export const SalesPage = lazy(() =>
  import('@/pages/sales/SalesPage').then((m) => ({ default: m.SalesPage })),
);

export const PurchasesPage = lazy(() =>
  import('@/pages/purchases/PurchasesPage').then((m) => ({ default: m.PurchasesPage })),
);

export const ExpensesPage = lazy(() =>
  import('@/pages/expenses/ExpensesPage').then((m) => ({ default: m.ExpensesPage })),
);

export const TransfersPage = lazy(() =>
  import('@/pages/transfers/TransfersPage').then((m) => ({ default: m.TransfersPage })),
);

export const AnalyticsPage = lazy(() =>
  import('@/pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);

export const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

export const LoginPage = lazy(() =>
  import('@/pages/login/LoginPage').then((m) => ({ default: m.LoginPage })),
);

export const BranchesPage = lazy(() =>
  import('@/pages/branches/BranchesPage').then((m) => ({ default: m.BranchesPage })),
);

export const AdminsPage = lazy(() =>
  import('@/pages/admins/AdminsPage').then((m) => ({ default: m.AdminsPage })),
);

export const CategoriesPage = lazy(() =>
  import('@/pages/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);

export const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
