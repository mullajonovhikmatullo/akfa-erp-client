export type PermissionMap<Role extends string, Permission extends string> = Record<Role, readonly Permission[]>

export const can = <Role extends string, Permission extends string>(
  role: Role | undefined,
  permission: Permission,
  permissionMap: PermissionMap<Role, Permission>,
) => {
  //
  if (!role) return false
  return permissionMap[role]?.includes(permission) ?? false
}
