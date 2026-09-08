import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import type { User } from '@store/store-stub';
import { tokenStore } from '@/shared/api/client';
import { can, type Permission } from '@/shared/config/permissions';
import { queryClient } from '@/app/providers/query/queryClient';
import { useUIStore } from '@/app/stores/ui.store';

interface AuthState {
  user: User | null;
  isHydrated: boolean;
  sessionVersion: number;
}

interface AuthActions {
  login: (user: User, accessToken: string) => void;
  logout: (expectedToken?: string | null) => void;
  setUser: (user: User) => void;
  can: (permission: Permission) => boolean;
  isStoreOwner: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isHydrated: false,
        sessionVersion: 0,

        login: (user, accessToken) => {
          //
          void queryClient.cancelQueries();
          queryClient.clear();
          useUIStore.getState().setActiveBranch('__all__');
          tokenStore.set(accessToken);
          set({ user, isHydrated: true, sessionVersion: get().sessionVersion + 1 }, false, 'auth/login');
        },

        logout: (expectedToken) => {
          //
          if (expectedToken !== undefined && tokenStore.get() !== expectedToken) return;
          void queryClient.cancelQueries();
          queryClient.clear();
          useUIStore.getState().setActiveBranch('__all__');
          tokenStore.clearAll();
          set({ user: null, sessionVersion: get().sessionVersion + 1 }, false, 'auth/logout');
        },

        setUser: (user) => {
          //
          const current = get().user;
          if (!current || current.id !== user.id || current.storeId !== user.storeId) return;
          set({ user }, false, 'auth/setUser');
        },

        can: (permission) => can(get().user?.role, permission),

        isStoreOwner: () => get().user?.role === 'store_owner',
      }),
      {
        name: 'store-auth',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
          //
          if (state) state.isHydrated = true;
        },
      },
    ),
    { name: 'AuthStore' },
  ),
);
