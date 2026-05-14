import type { Permission } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';

export interface NavItemDef {
  key: string;
  path: string;
  label: string;
  icon: string;
  permission?: Permission;
}

export interface NavGroupDef {
  groupKey: string;
  groupLabel: string;
  items: NavItemDef[];
}

// Legacy shape – kept for AppHeader breadcrumb lookup
export interface NavItem extends NavItemDef {
  labelKey: string;
  group: string | null;
}

export interface NavGroup {
  group: string | null;
  items: NavItem[];
}

export const NAV_GROUPS_DEF: NavGroupDef[] = [
  {
    groupKey: 'main',
    groupLabel: 'АСОСИЙ',
    items: [
      { key: 'dashboard', path: ROUTES.DASHBOARD, label: 'Асосий', icon: 'DashboardOutlined' },
    ],
  },
  {
    groupKey: 'savdo',
    groupLabel: 'САВДО',
    items: [
      { key: 'sales', path: ROUTES.SALES, label: 'Сотувлар', icon: 'ShoppingCartOutlined', permission: 'sales:view' },
      { key: 'customers', path: ROUTES.CUSTOMERS, label: 'Мижозлар', icon: 'TeamOutlined', permission: 'customers:create' },
    ],
  },
  {
    groupKey: 'ombor',
    groupLabel: 'ОМБОР',
    items: [
      { key: 'products', path: ROUTES.PRODUCTS, label: 'Маҳсулотлар', icon: 'InboxOutlined', permission: 'products:create' },
      { key: 'categories', path: ROUTES.CATEGORIES, label: 'Категориялар', icon: 'AppstoreOutlined', permission: 'category:manage' },
      { key: 'purchases', path: ROUTES.PURCHASES, label: 'Кирим', icon: 'DropboxOutlined', permission: 'purchases:view' },
      { key: 'transfers', path: ROUTES.TRANSFERS, label: 'Трансферлар', icon: 'SwapOutlined', permission: 'transfers:view' },
    ],
  },
  {
    groupKey: 'moliya',
    groupLabel: 'МОЛИЯ',
    items: [
      { key: 'expenses', path: ROUTES.EXPENSES, label: 'Харажатлар', icon: 'WalletOutlined', permission: 'expenses:view' },
    ],
  },
  {
    groupKey: 'tahlil',
    groupLabel: 'ТАҲЛИЛ',
    items: [
      { key: 'analytics', path: ROUTES.ANALYTICS, label: 'Аналитика', icon: 'LineChartOutlined', permission: 'analytics:global' },
    ],
  },
  {
    groupKey: 'boshqaruv',
    groupLabel: 'БОШҚАРУВ',
    items: [
      { key: 'branches', path: ROUTES.BRANCHES, label: 'Филиаллар', icon: 'BankOutlined', permission: 'branch:create' },
      { key: 'admins', path: ROUTES.ADMINS, label: 'Администраторлар', icon: 'UserSwitchOutlined', permission: 'admin:create' },
    ],
  },
  {
    groupKey: 'sozlamalar',
    groupLabel: 'СОЗЛАМАЛАР',
    items: [
      { key: 'settings', path: ROUTES.SETTINGS, label: 'Созламалар', icon: 'SettingOutlined' },
    ],
  },
];

// All items flat – for search and favorites lookup
export const ALL_NAV_ITEMS: NavItemDef[] = NAV_GROUPS_DEF.flatMap((g) => g.items);

export function getVisibleNavGroups(
  checkCan: (p: Permission) => boolean,
): NavGroupDef[] {
  return NAV_GROUPS_DEF.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || checkCan(item.permission)),
  })).filter((group) => group.items.length > 0);
}

// Legacy compat – AppHeader uses NAV_ITEMS for breadcrumb label lookup
export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.map((item) => ({
  ...item,
  labelKey: `nav.${item.key}`,
  group: null,
}));

export function getVisibleNavItems(
  checkCan: (p: Permission) => boolean,
): NavGroup[] {
  const filtered = NAV_ITEMS.filter(
    (item) => !item.permission || checkCan(item.permission),
  );
  return [{ group: null, items: filtered }];
}
