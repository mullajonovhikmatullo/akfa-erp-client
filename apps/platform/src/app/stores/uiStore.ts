import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';

const storageKey = 'platform-theme';

const systemTheme = (): ThemeMode =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const storedPreference = (): ThemePreference => {
  //
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
};

interface UIState {
  preference: ThemePreference;
  theme: ThemeMode;
  toggleTheme: () => void;
  syncSystemTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => {
  //
  const preference = storedPreference();
  return {
    preference,
    theme: preference === 'system' ? systemTheme() : preference,
    toggleTheme: () => {
      //
      const theme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch {
        //
      }
      set({ preference: theme, theme });
    },
    syncSystemTheme: () => {
      //
      if (get().preference === 'system') set({ theme: systemTheme() });
    },
  };
});
