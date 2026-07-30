import { useAuthStore } from '@/entities/user';
import type { Permission } from '@/shared/config/permissions';

export function useCurrentUser() {
  //
  const user = useAuthStore((s) => s.user);
  const isStoreOwner = useAuthStore((s) => s.isStoreOwner)();
  const checkCan = useAuthStore((s) => s.can);

  return {
    user,
    isAuthenticated: user !== null,
    isStoreOwner,
    can: (permission: Permission) => checkCan(permission),
    branchId: user?.branchId ?? null,
  };
}
