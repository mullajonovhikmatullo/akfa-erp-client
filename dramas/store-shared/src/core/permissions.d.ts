export type PermissionMap<Role extends string, Permission extends string> = Record<Role, readonly Permission[]>;
export declare const can: <Role extends string, Permission extends string>(role: Role | undefined, permission: Permission, permissionMap: PermissionMap<Role, Permission>) => boolean;
//# sourceMappingURL=permissions.d.ts.map