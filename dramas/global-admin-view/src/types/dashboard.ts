import type { ComponentType } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type AppIconComponent = ComponentType<{
  size?: number;
  weight?: IconWeight;
  className?: string;
  color?: string;
}>;

export type AccentTone = 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral';

export interface GlobalAdminProfile {
  id: string;
  name: string;
  role: string;
  accessLevel: string;
  avatarUrl: string;
  platformName: string;
  managedTenants: number;
  lastLogin: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  description: string;
  change?: number;
  changeLabel?: string;
  progress?: number;
  accent: AccentTone;
}

export type TenantStatus = 'Faol' | 'Sinov muddatida' | 'Qarzdor' | 'Bloklangan';

export interface TenantCompany {
  id: string;
  name: string;
  plan: string;
  stores: string;
  status: TenantStatus;
}

export interface SubscriptionRenewal {
  id: string;
  time: string;
  company: string;
  plan: string;
  responsibleAdmin: string;
  type: string;
}

export interface RevenueActivity {
  day: string;
  amount: number;
}

export interface PaymentDue {
  id: string;
  company: string;
  date: string;
  remaining: string;
  amount: number;
}

export type AnnouncementCategory = 'Tizim' | 'Admin';

export interface SystemAnnouncement {
  id: string;
  title: string;
  date: string;
  category: AnnouncementCategory;
}

export interface SupportRequest {
  id: string;
  title: string;
  company: string;
  priority: 'Past' | 'O‘rta' | 'Yuqori';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  company: string;
  time: string;
  day: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: AppIconComponent;
  path?: string;
  children?: NavigationItem[];
}

export interface DashboardData {
  admin: GlobalAdminProfile;
  revenue: {
    amount: number;
    currency: 'UZS';
    monthlyChange: number;
    progress: number;
  };
  tenants: {
    active: number;
    weeklyChange: number;
    totalStores: number;
    progress: number;
    companies: TenantCompany[];
  };
  payments: {
    dueSoon: number;
    overdue: number;
    upcoming: PaymentDue[];
  };
  support: {
    newRequests: number;
    requests: SupportRequest[];
  };
  platform: {
    health: number;
    statusIndicators: number[];
  };
  selectedCalendarDay: number;
  renewals: SubscriptionRenewal[];
  revenueActivity: RevenueActivity[];
  todayEvents: CalendarEvent[];
  announcements: SystemAnnouncement[];
}
