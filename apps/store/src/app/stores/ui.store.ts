import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { StoreLocale } from '@store/store-i18n';
import type { Currency } from '@store/store-stub';

type Density = 'compact' | 'default' | 'spacious';
export type Theme = 'light' | 'dark' | 'system';
export type { StoreLocale } from '@store/store-i18n';

interface UIState {
  activeBranchId: string;
  lang: StoreLocale;
  theme: Theme;
  density: Density;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  displayCurrency: Currency;
  exchangeRate: number;
  sidebarFavorites: string[];
}

interface UIActions {
  setActiveBranch: (id: string) => void;
  setLang: (lang: StoreLocale) => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setDisplayCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  toggleFavorite: (key: string) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        activeBranchId: '__all__',
        lang: 'uz-cy',
        theme: 'light',
        density: 'default',
        sidebarCollapsed: false,
        mobileSidebarOpen: false,
        displayCurrency: 'UZS',
        exchangeRate: 12_650,
        sidebarFavorites: [],

        setActiveBranch: (id) => set({ activeBranchId: id }, false, 'ui/setActiveBranch'),
        setLang: (lang) => set({ lang }, false, 'ui/setLang'),
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        setDensity: (density) => set({ density }, false, 'ui/setDensity'),
        toggleSidebar: () =>
          set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }), false, 'ui/toggleSidebar'),
        toggleMobileSidebar: () =>
          set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen }), false, 'ui/toggleMobileSidebar'),
        closeMobileSidebar: () =>
          set({ mobileSidebarOpen: false }, false, 'ui/closeMobileSidebar'),
        setDisplayCurrency: (displayCurrency) =>
          set({ displayCurrency }, false, 'ui/setDisplayCurrency'),
        setExchangeRate: (exchangeRate) =>
          set({ exchangeRate }, false, 'ui/setExchangeRate'),
        toggleFavorite: (key) =>
          set(
            (s) => ({
              sidebarFavorites: s.sidebarFavorites.includes(key)
                ? s.sidebarFavorites.filter((k) => k !== key)
                : [...s.sidebarFavorites, key],
            }),
            false,
            'ui/toggleFavorite',
          ),
      }),
      {
        name: 'store-ui',
        partialize: (s) => ({
          lang: s.lang,
          theme: s.theme,
          density: s.density,
          displayCurrency: s.displayCurrency,
          exchangeRate: s.exchangeRate,
          sidebarCollapsed: s.sidebarCollapsed,
          sidebarFavorites: s.sidebarFavorites,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
