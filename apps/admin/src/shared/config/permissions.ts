import type { UserRole } from '@/shared/types';

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
  | 'settings:global';

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
  branch_admin: BRANCH_ADMIN_PERMISSIONS,
};

export function can(role: UserRole | undefined, permission: Permission): boolean {
  //
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
