import { useAuthStore } from '../model/auth.store';
import type { Permission } from '@/shared/config/permissions';

export function useCurrentUser() {
  //
  const user = useAuthStore((s) => s.user);
  const isSuper = useAuthStore((s) => s.isSuper)();
  const checkCan = useAuthStore((s) => s.can);

  return {
    user,
    isAuthenticated: user !== null,
    isSuper,
    can: (permission: Permission) => checkCan(permission),
    branchId: user?.branchId ?? null,
  };
}
