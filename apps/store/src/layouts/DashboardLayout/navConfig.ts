import type { Permission } from '@/shared/config/permissions'
import { ROUTES } from '@/shared/config/routes'

export interface NavItemDef {
  key: string
  path: string
  icon: string
  permission?: Permission
}

export interface NavGroupDef {
  groupKey: string
  groupLabelKey: string
  items: NavItemDef[]
}

export const NAV_GROUPS_DEF: NavGroupDef[] = [
  {
    groupKey: 'main',
    groupLabelKey: 'nav.group.main',
    items: [{ key: 'dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' }],
  },
  {
    groupKey: 'savdo',
    groupLabelKey: 'nav.group.savdo',
    items: [
      { key: 'sales', path: ROUTES.SALES, icon: 'sales', permission: 'sales:view' },
      { key: 'customers', path: ROUTES.CUSTOMERS, icon: 'customers', permission: 'customers:create' },
    ],
  },
  {
    groupKey: 'ombor',
    groupLabelKey: 'nav.group.ombor',
    items: [
      { key: 'categories', path: ROUTES.CATEGORIES, icon: 'categories', permission: 'category:manage' },
      { key: 'products', path: ROUTES.PRODUCTS, icon: 'products', permission: 'products:create' },
      { key: 'purchases', path: ROUTES.PURCHASES, icon: 'purchases', permission: 'purchases:view' },
      { key: 'inventory', path: ROUTES.INVENTORY, icon: 'inventory', permission: 'purchases:view' },
      { key: 'transfers', path: ROUTES.TRANSFERS, icon: 'transfers', permission: 'transfers:view' },
    ],
  },
  {
    groupKey: 'moliya',
    groupLabelKey: 'nav.group.moliya',
    items: [
      { key: 'expenses', path: ROUTES.EXPENSES, icon: 'expenses', permission: 'expenses:view' },
      { key: 'billing', path: ROUTES.BILLING, icon: 'billing', permission: 'billing:manage' },
    ],
  },
  {
    groupKey: 'tahlil',
    groupLabelKey: 'nav.group.tahlil',
    items: [{ key: 'analytics', path: ROUTES.ANALYTICS, icon: 'analytics', permission: 'analytics:global' }],
  },
  {
    groupKey: 'boshqaruv',
    groupLabelKey: 'nav.group.boshqaruv',
    items: [
      { key: 'branches', path: ROUTES.BRANCHES, icon: 'branches', permission: 'branch:create' },
      { key: 'admins', path: ROUTES.ADMINS, icon: 'admins', permission: 'admin:create' },
    ],
  },
  {
    groupKey: 'sozlamalar',
    groupLabelKey: 'nav.group.sozlamalar',
    items: [{ key: 'settings', path: ROUTES.SETTINGS, icon: 'settings' }],
  },
]

export const ALL_NAV_ITEMS = NAV_GROUPS_DEF.flatMap((group) => group.items)

export function getVisibleNavGroups(checkCan: (permission: Permission) => boolean) {
  //
  return NAV_GROUPS_DEF.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || checkCan(item.permission)),
  })).filter((group) => group.items.length > 0)
}
