import {
  Buildings,
  ChartLineUp,
  CreditCard,
  GearSix,
  Headset,
  House,
  Receipt,
  ShieldCheck,
  Storefront,
  UsersThree,
} from '@phosphor-icons/react';
import type { NavigationItem } from '../shared/types';
import { routes } from './routes';

export const primaryNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Boshqaruv paneli',
    path: routes.dashboard,
    icon: House,
  },
  {
    id: 'companies',
    label: 'Mijoz kompaniyalar',
    icon: Buildings,
    children: [
      { id: 'companies-overview', label: 'Umumiy ko‘rinish', path: routes.companies, icon: Buildings },
      { id: 'companies-new', label: 'Yangi kompaniya', path: routes.companiesNew, icon: Buildings },
      { id: 'companies-active', label: 'Faol mijozlar', path: routes.companiesActive, icon: Buildings },
      { id: 'companies-blocked', label: 'Bloklangan mijozlar', path: routes.companiesBlocked, icon: Buildings },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Obunalar',
    icon: CreditCard,
    children: [
      { id: 'plans', label: 'Tariflar', path: routes.subscriptionPlans, icon: CreditCard },
      { id: 'payments', label: 'To‘lovlar', path: routes.subscriptionPayments, icon: Receipt },
      { id: 'debts', label: 'Qarzdorliklar', path: routes.subscriptionDebts, icon: Receipt },
      { id: 'renewals', label: 'Yangilanishlar', path: routes.subscriptionRenewals, icon: CreditCard },
    ],
  },
  {
    id: 'stores',
    label: 'Do‘konlar',
    icon: Storefront,
    children: [
      { id: 'branches', label: 'Filiallar', path: '/stores/branches', icon: Storefront },
      { id: 'warehouses', label: 'Omborlar', path: '/stores/warehouses', icon: Storefront },
      { id: 'sales', label: 'Faol sotuvlar', path: '/stores/sales', icon: Storefront },
    ],
  },
  {
    id: 'admins',
    label: 'Adminlar',
    icon: ShieldCheck,
    children: [
      { id: 'platforms', label: 'Platform adminlar', path: '/admins/global', icon: ShieldCheck },
      { id: 'company-admins', label: 'Kompaniya adminlari', path: '/admins/company', icon: UsersThree },
      { id: 'login-history', label: 'Kirish tarixi', path: '/admins/login-history', icon: ShieldCheck },
    ],
  },
  {
    id: 'analytics',
    label: 'Analitika',
    icon: ChartLineUp,
    children: [
      { id: 'analytics-revenue', label: 'Daromad', path: '/analytics/revenue', icon: ChartLineUp },
      { id: 'analytics-growth', label: 'Mijozlar o‘sishi', path: '/analytics/growth', icon: ChartLineUp },
      { id: 'analytics-activity', label: 'Tizim faolligi', path: '/analytics/activity', icon: ChartLineUp },
    ],
  },
  {
    id: 'requests',
    label: 'Murojaatlar',
    path: '/support-requests',
    icon: Headset,
  },
  {
    id: 'settings',
    label: 'Tizim sozlamalari',
    path: '/settings',
    icon: GearSix,
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  {
    id: 'help',
    label: 'Yordam va qo‘llab-quvvatlash',
    path: '/help',
    icon: Headset,
  },
];
