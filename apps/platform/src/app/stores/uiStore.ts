import { create } from 'zustand';
import { themeStorageKey } from '../../config/theme';
import type { ThemeMode, ThemePreference } from '../../shared/types';

interface UIState {
  themePreference: ThemePreference;
  resolvedTheme: ThemeMode;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  syncSystemTheme: (theme: ThemeMode) => void;
}

const canUseDOM = typeof window !== 'undefined';

const getSystemTheme = (): ThemeMode => {
  //
  if (!canUseDOM) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredPreference = (): ThemePreference => {
  //
  if (!canUseDOM) {
    return 'system';
  }

  const stored = window.localStorage.getItem(themeStorageKey);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const resolveTheme = (preference: ThemePreference): ThemeMode =>
  preference === 'system' ? getSystemTheme() : preference;

export const useUIStore = create<UIState>((set, get) => {
  //
  const initialPreference = getStoredPreference();

  return {
    themePreference: initialPreference,
    resolvedTheme: resolveTheme(initialPreference),
    setThemePreference: (preference) => {
      //
      if (canUseDOM) {
        if (preference === 'system') {
          window.localStorage.removeItem(themeStorageKey);
        } else {
          window.localStorage.setItem(themeStorageKey, preference);
        }
      }

      set({
        themePreference: preference,
        resolvedTheme: resolveTheme(preference),
      });
    },
    toggleTheme: () => {
      //
      const nextTheme: ThemeMode = get().resolvedTheme === 'dark' ? 'light' : 'dark';
      get().setThemePreference(nextTheme);
    },
    syncSystemTheme: (theme) => {
      //
      if (get().themePreference === 'system') {
        set({ resolvedTheme: theme });
      }
    },
  };
});
