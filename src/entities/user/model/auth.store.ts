import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User } from '@/shared/types';
import { tokenStore } from '@/shared/api/client';
import { can, type Permission } from '@/shared/config/permissions';

interface AuthState {
  user: User | null;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  can: (permission: Permission) => boolean;
  isSuper: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isHydrated: false,

        login: (user, accessToken) => {
          tokenStore.set(accessToken);
          set({ user, isHydrated: true }, false, 'auth/login');
        },

        logout: () => {
          tokenStore.clearAll();
          set({ user: null }, false, 'auth/logout');
        },

        setUser: (user) => set({ user }, false, 'auth/setUser'),

        can: (permission) => can(get().user?.role, permission),

        isSuper: () => get().user?.role === 'super_admin',
      }),
      {
        name: 'akfa-auth',
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
          if (state) state.isHydrated = true;
        },
      },
    ),
    { name: 'AuthStore' },
  ),
);
