import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Currency } from '@/shared/types';

type Density = 'compact' | 'default' | 'spacious';
type Lang = 'en' | 'ru' | 'uz';

interface UIState {
  activeBranchId: string;
  lang: Lang;
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
        lang: 'en',
        density: 'default',
        sidebarCollapsed: false,
        mobileSidebarOpen: false,
        displayCurrency: 'UZS',
        exchangeRate: 12_650,
        lowStockThreshold: 50,
        sidebarFavorites: [],

        setActiveBranch: (id) => set({ activeBranchId: id }, false, 'ui/setActiveBranch'),
        setLang: (lang) => set({ lang }, false, 'ui/setLang'),
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
        name: 'akfa-ui',
        partialize: (s) => ({
          lang: s.lang,
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
