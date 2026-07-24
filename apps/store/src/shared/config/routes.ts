export const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/',
  PRODUCTS: '/products',
  CUSTOMERS: '/customers',
  SALES: '/sales',
  PURCHASES: '/purchases',
  EXPENSES: '/expenses',
  TRANSFERS: '/transfers',
  ANALYTICS: '/analytics',
  BRANCHES: '/branches',
  ADMINS: '/admins',
  CATEGORIES: '/categories',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
