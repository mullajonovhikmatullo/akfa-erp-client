export const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/',
  PRODUCTS: '/products',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: '/customers/:customerId',
  SALES: '/sales',
  PURCHASES: '/purchases',
  PURCHASE_DETAIL: '/purchases/:receiptId',
  INVENTORY: '/inventory',
  EXPENSES: '/expenses',
  BILLING: '/billing',
  TRANSFERS: '/transfers',
  TRANSFER_DETAIL: '/transfers/:transferId',
  ANALYTICS: '/analytics',
  BRANCHES: '/branches',
  ADMINS: '/admins',
  CATEGORIES: '/categories',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
