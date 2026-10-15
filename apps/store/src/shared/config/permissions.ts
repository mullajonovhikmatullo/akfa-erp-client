import type { User } from '@store/store-stub';

export type Permission =
  | 'branch:switch'
  | 'branch:create'
  | 'branch:edit'
  | 'branch:delete'
  | 'admin:create'
  | 'analytics:global'
  | 'sales:create'
  | 'sales:view'
  | 'purchases:create'
  | 'purchases:view'
  | 'expenses:create'
  | 'expenses:view'
  | 'transfers:create'
  | 'transfers:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'category:manage'
  | 'customers:create'
  | 'customers:edit'
  | 'settings:global'
  | 'billing:manage';

const STORE_OWNER_PERMISSIONS: Permission[] = [
  'branch:switch',
  'branch:create',
  'branch:edit',
  'branch:delete',
  'admin:create',
  'analytics:global',
  'sales:create',
  'sales:view',
  'purchases:create',
  'purchases:view',
  'expenses:create',
  'expenses:view',
  'transfers:create',
  'transfers:view',
  'products:create',
  'products:edit',
  'products:delete',
  'category:manage',
  'customers:create',
  'customers:edit',
  'settings:global',
  'billing:manage',
];

const BRANCH_ADMIN_PERMISSIONS: Permission[] = [
  'sales:create',
  'sales:view',
  'purchases:create',
  'purchases:view',
  'expenses:create',
  'expenses:view',
  'transfers:create',
  'transfers:view',
  'products:create',
  'products:edit',
  'customers:create',
  'customers:edit',
];

export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  store_owner: STORE_OWNER_PERMISSIONS,
  branch_admin: BRANCH_ADMIN_PERMISSIONS,
};

export function can(user: Pick<User, 'role' | 'store'> | null | undefined, permission: Permission): boolean {
  //
  if (!user?.role) return false;
  if (permission === 'billing:manage' && user.store?.plan?.billingType === 'LIFETIME') return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}
