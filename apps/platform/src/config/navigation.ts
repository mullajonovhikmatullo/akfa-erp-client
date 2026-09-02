import type { NavigationItem } from '../shared/types';
import { routes } from './routes';

export const primaryNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Boshqaruv paneli',
    path: routes.dashboard,
    icon: 'house',
  },
  {
    id: 'companies',
    label: 'Mijoz kompaniyalar',
    icon: 'buildings',
    children: [
      { id: 'companies-overview', label: 'Umumiy ko‘rinish', path: routes.companies, icon: 'buildings' },
      { id: 'companies-new', label: 'Yangi kompaniya', path: routes.companiesNew, icon: 'buildings' },
      { id: 'companies-active', label: 'Faol mijozlar', path: routes.companiesActive, icon: 'buildings' },
      { id: 'companies-blocked', label: 'Bloklangan mijozlar', path: routes.companiesBlocked, icon: 'buildings' },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Obunalar',
    icon: 'payments',
    children: [
      { id: 'plans', label: 'Tariflar', path: routes.subscriptionPlans, icon: 'payments' },
      { id: 'payments', label: 'To‘lovlar', path: routes.subscriptionPayments, icon: 'file' },
      { id: 'debts', label: 'Qarzdorliklar', path: routes.subscriptionDebts, icon: 'file' },
      { id: 'renewals', label: 'Yangilanishlar', path: routes.subscriptionRenewals, icon: 'payments' },
    ],
  },
  {
    id: 'stores',
    label: 'Do‘konlar',
    icon: 'building',
    children: [
      { id: 'branches', label: 'Filiallar', path: '/stores/branches', icon: 'building' },
      { id: 'warehouses', label: 'Omborlar', path: '/stores/warehouses', icon: 'building' },
      { id: 'sales', label: 'Faol sotuvlar', path: '/stores/sales', icon: 'building' },
    ],
  },
  {
    id: 'admins',
    label: 'Adminlar',
    icon: 'user_check',
    children: [
      { id: 'platforms', label: 'Platform adminlar', path: '/admins/global', icon: 'user_check' },
      { id: 'company-admins', label: 'Kompaniya adminlari', path: '/admins/company', icon: 'users-group' },
      { id: 'login-history', label: 'Kirish tarixi', path: '/admins/login-history', icon: 'user_check' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analitika',
    icon: 'chart_line',
    children: [
      { id: 'analytics-revenue', label: 'Daromad', path: '/analytics/revenue', icon: 'chart_line' },
      { id: 'analytics-growth', label: 'Mijozlar o‘sishi', path: '/analytics/growth', icon: 'chart_line' },
      { id: 'analytics-activity', label: 'Tizim faolligi', path: '/analytics/activity', icon: 'chart_line' },
    ],
  },
  {
    id: 'requests',
    label: 'Murojaatlar',
    path: '/support-requests',
    icon: 'header-support',
  },
  {
    id: 'settings',
    label: 'Tizim sozlamalari',
    path: '/settings',
    icon: 'settings',
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  {
    id: 'help',
    label: 'Yordam va qo‘llab-quvvatlash',
    path: '/help',
    icon: 'header-support',
  },
];
