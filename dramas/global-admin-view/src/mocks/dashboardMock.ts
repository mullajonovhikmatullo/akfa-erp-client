import adminAvatarUrl from '../assets/admin-avatar.svg';
import type { DashboardData } from '../types/dashboard';

export const dashboardMock: DashboardData = {
  admin: {
    id: 'GADM-01',
    name: 'Xikmatullo Admin',
    role: 'Global super admin',
    accessLevel: 'Platform owner',
    avatarUrl: adminAvatarUrl,
    platformName: 'Store Management SaaS',
    managedTenants: 24,
    lastLogin: '2026-07-21T09:10:00+05:00',
  },
  revenue: {
    amount: 48500000,
    currency: 'UZS',
    monthlyChange: 12.5,
    progress: 76,
  },
  tenants: {
    active: 24,
    weeklyChange: 4.3,
    totalStores: 86,
    progress: 68,
    companies: [
      {
        id: 'tenant-akfa',
        name: 'Akfa Savdo LLC',
        plan: 'Premium',
        stores: '12 ta filial',
        status: 'Faol',
      },
      {
        id: 'tenant-nextree',
        name: 'Nextree Market',
        plan: 'Standard',
        stores: '4 ta filial',
        status: 'Sinov muddatida',
      },
      {
        id: 'tenant-baraka',
        name: 'Baraka Market',
        plan: 'Basic',
        stores: '2 ta filial',
        status: 'Qarzdor',
      },
    ],
  },
  payments: {
    dueSoon: 3,
    overdue: 1,
    upcoming: [
      {
        id: 'pay-akfa',
        company: 'Akfa Savdo LLC',
        date: '2026-07-25T10:00:00+05:00',
        remaining: '4 kun qoldi',
        amount: 5000000,
      },
      {
        id: 'pay-nextree',
        company: 'Nextree Market',
        date: '2026-07-28T10:00:00+05:00',
        remaining: '7 kun qoldi',
        amount: 2500000,
      },
    ],
  },
  support: {
    newRequests: 7,
    requests: [],
  },
  platform: {
    health: 99.8,
    statusIndicators: [1, 1, 1, 1, 0.78],
  },
  selectedCalendarDay: 10,
  renewals: [
    {
      id: 'renewal-akfa',
      time: '10:00–11:30',
      company: 'Akfa Savdo LLC',
      plan: 'Premium',
      responsibleAdmin: 'Jamoliddin Aliyev',
      type: 'Obuna yangilanishi',
    },
  ],
  revenueActivity: [
    { day: 'Du', amount: 5.2 },
    { day: 'Se', amount: 7.4 },
    { day: 'Ch', amount: 6.8 },
    { day: 'Pa', amount: 9.1 },
    { day: 'Ju', amount: 8.6 },
    { day: 'Sha', amount: 10.5 },
    { day: 'Ya', amount: 12.4 },
  ],
  todayEvents: [
    {
      id: 'event-premium-nextree',
      title: 'Premium tarif yangilanishi',
      type: 'Obuna',
      company: 'Nextree Market',
      time: '12:00',
      day: 10,
    },
  ],
  announcements: [
    {
      id: 'announcement-plan-settings',
      title: 'Yangi tarif sozlamalari qo‘shildi.',
      date: '2024-07-08T09:00:00+05:00',
      category: 'Tizim',
    },
    {
      id: 'announcement-warehouse-export',
      title: 'Ombor hisoboti eksporti yangilandi.',
      date: '2024-07-06T12:00:00+05:00',
      category: 'Tizim',
    },
    {
      id: 'announcement-admin-permissions',
      title: 'Kompaniya adminlari uchun yangi ruxsatlar qo‘shildi.',
      date: '2024-07-05T16:00:00+05:00',
      category: 'Admin',
    },
  ],
};
