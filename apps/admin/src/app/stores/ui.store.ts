import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Lang } from '@/shared/lib/lang';
import type { Currency } from '@/shared/types';

type Density = 'compact' | 'default' | 'spacious';
export type Theme = 'light' | 'dark' | 'system';
export type { Lang } from '@/shared/lib/lang';

interface UIState {
  activeBranchId: string;
  lang: Lang;
  theme: Theme;
  density: Density;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  displayCurrency: Currency;
  exchangeRate: number;
  lowStockThreshold: number;
  sidebarFavorites: string[];
}

interface UIActions {
  setActiveBranch: (id: string) => void;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setDisplayCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  setLowStockThreshold: (threshold: number) => void;
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
        lowStockThreshold: 50,
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
        setLowStockThreshold: (lowStockThreshold) =>
          set({ lowStockThreshold }, false, 'ui/setLowStockThreshold'),
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
        name: 'akfa-ui',
        partialize: (s) => ({
          lang: s.lang,
          theme: s.theme,
          density: s.density,
          displayCurrency: s.displayCurrency,
          exchangeRate: s.exchangeRate,
          lowStockThreshold: s.lowStockThreshold,
          sidebarCollapsed: s.sidebarCollapsed,
          sidebarFavorites: s.sidebarFavorites,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
