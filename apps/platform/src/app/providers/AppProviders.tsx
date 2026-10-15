import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Tooltip } from 'radix-ui';
import { useUIStore } from '../stores/uiStore';

export const platformQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

const routerBasename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

function useThemeClass() {
  //
  const theme = useUIStore((state) => state.theme);
  const syncSystemTheme = useUIStore((state) => state.syncSystemTheme);

  useEffect(() => {
    //
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    //
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', syncSystemTheme);
    return () => media.removeEventListener('change', syncSystemTheme);
  }, [syncSystemTheme]);

  return theme;
}

export function AppProviders({ children }: { children: ReactNode }) {
  //
  const theme = useThemeClass();

  return (
    <QueryClientProvider client={platformQueryClient}>
      <Tooltip.Provider delayDuration={300}>
        <BrowserRouter basename={routerBasename}>{children}</BrowserRouter>
      </Tooltip.Provider>
      <Toaster theme={theme} position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );
}
