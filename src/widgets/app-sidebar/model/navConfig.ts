import type { Permission } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';

export interface NavItem {
  key: string;
  path: string;
  labelKey: string;
  icon: string;
  group: string | null;
  permission?: Permission;
}

export interface NavGroup {
  group: string | null;
  items: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    path: ROUTES.DASHBOARD,
    labelKey: 'nav.dashboard',
    icon: 'DashboardOutlined',
    group: null,
  },
  {
    key: 'products',
    path: ROUTES.PRODUCTS,
    labelKey: 'nav.products',
    icon: 'InboxOutlined',
    group: 'nav.catalog',
    permission: 'products:create',
  },
  {
    key: 'customers',
    path: ROUTES.CUSTOMERS,
    labelKey: 'nav.customers',
    icon: 'TeamOutlined',
    group: 'nav.catalog',
    permission: 'customers:create',
  },
  {
    key: 'sales',
    path: ROUTES.SALES,
    labelKey: 'nav.sales',
    icon: 'ShoppingCartOutlined',
    group: 'nav.operations',
    permission: 'sales:view',
  },
  {
    key: 'purchases',
    path: ROUTES.PURCHASES,
    labelKey: 'nav.purchases',
    icon: 'DropboxOutlined',
    group: 'nav.operations',
    permission: 'purchases:view',
  },
  {
    key: 'expenses',
    path: ROUTES.EXPENSES,
    labelKey: 'nav.expenses',
    icon: 'WalletOutlined',
    group: 'nav.operations',
    permission: 'expenses:view',
  },
  {
    key: 'transfers',
    path: ROUTES.TRANSFERS,
    labelKey: 'nav.transfers',
    icon: 'SwapOutlined',
    group: 'nav.operations',
    permission: 'transfers:view',
  },
  {
    key: 'analytics',
    path: ROUTES.ANALYTICS,
    labelKey: 'nav.analytics',
    icon: 'LineChartOutlined',
    group: 'nav.insights',
    permission: 'analytics:global',
  },
  {
    key: 'settings',
    path: ROUTES.SETTINGS,
    labelKey: 'nav.settings',
    icon: 'SettingOutlined',
    group: 'nav.insights',
  },
];

export function getVisibleNavItems(
  checkCan: (p: Permission) => boolean,
): NavGroup[] {
  const filtered = NAV_ITEMS.filter(
    (item) => !item.permission || checkCan(item.permission),
  );

  const groups: NavGroup[] = [];
  let lastGroup: string | null = '__init__';

  for (const item of filtered) {
    if (item.group !== lastGroup) {
      groups.push({ group: item.group, items: [] });
      lastGroup = item.group;
    }
    groups[groups.length - 1]!.items.push(item);
  }

  return groups;
}
