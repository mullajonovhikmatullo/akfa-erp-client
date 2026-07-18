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
  groupLabelKey: string;
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
    groupLabelKey: 'nav.group.main',
    items: [
      { key: 'dashboard', path: ROUTES.DASHBOARD, label: 'Асосий', icon: 'dashboard' },
    ],
  },
  {
    groupKey: 'savdo',
    groupLabel: 'САВДО',
    groupLabelKey: 'nav.group.savdo',
    items: [
      { key: 'sales', path: ROUTES.SALES, label: 'Сотувлар', icon: 'sales', permission: 'sales:view' },
      { key: 'customers', path: ROUTES.CUSTOMERS, label: 'Мижозлар', icon: 'customers', permission: 'customers:create' },
    ],
  },
  {
    groupKey: 'ombor',
    groupLabel: 'ОМБОР',
    groupLabelKey: 'nav.group.ombor',
    items: [
      { key: 'categories', path: ROUTES.CATEGORIES, label: 'Категориялар', icon: 'categories', permission: 'category:manage' },
      { key: 'products', path: ROUTES.PRODUCTS, label: 'Маҳсулотлар', icon: 'products', permission: 'products:create' },
      { key: 'purchases', path: ROUTES.PURCHASES, label: 'Кирим', icon: 'purchases', permission: 'purchases:view' },
      { key: 'transfers', path: ROUTES.TRANSFERS, label: 'Трансферлар', icon: 'transfers', permission: 'transfers:view' },
    ],
  },
  {
    groupKey: 'moliya',
    groupLabel: 'МОЛИЯ',
    groupLabelKey: 'nav.group.moliya',
    items: [
      { key: 'expenses', path: ROUTES.EXPENSES, label: 'Харажатлар', icon: 'expenses', permission: 'expenses:view' },
    ],
  },
  {
    groupKey: 'tahlil',
    groupLabel: 'ТАҲЛИЛ',
    groupLabelKey: 'nav.group.tahlil',
    items: [
      { key: 'analytics', path: ROUTES.ANALYTICS, label: 'Аналитика', icon: 'analytics', permission: 'analytics:global' },
    ],
  },
  {
    groupKey: 'boshqaruv',
    groupLabel: 'БОШҚАРУВ',
    groupLabelKey: 'nav.group.boshqaruv',
    items: [
      { key: 'branches', path: ROUTES.BRANCHES, label: 'Филиаллар', icon: 'branches', permission: 'branch:create' },
      { key: 'admins', path: ROUTES.ADMINS, label: 'Администраторлар', icon: 'admins', permission: 'admin:create' },
    ],
  },
  {
    groupKey: 'sozlamalar',
    groupLabel: 'СОЗЛАМАЛАР',
    groupLabelKey: 'nav.group.sozlamalar',
    items: [
      { key: 'settings', path: ROUTES.SETTINGS, label: 'Созламалар', icon: 'settings' },
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
