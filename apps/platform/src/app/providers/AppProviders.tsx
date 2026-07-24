import { App as AntdApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { createAntdTheme } from '../../config/theme';
import { useUIStore } from '../stores/uiStore';
import type { ThemeMode } from '../../shared/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const routerBasename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

const getSystemTheme = (): ThemeMode =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const useThemeController = () => {
  //
  const themePreference = useUIStore((state) => state.themePreference);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const syncSystemTheme = useUIStore((state) => state.syncSystemTheme);

  useEffect(() => {
    //
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => syncSystemTheme(getSystemTheme());

    if (themePreference === 'system') {
      handleChange();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [syncSystemTheme, themePreference]);
};

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  //
  useThemeController();
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const antdTheme = useMemo(() => createAntdTheme(resolvedTheme), [resolvedTheme]);

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={routerBasename}>{children}</BrowserRouter>
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              className: 'app-toast',
            }}
          />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
};
