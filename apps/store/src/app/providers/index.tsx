import type { ReactNode } from 'react';
import { StoreI18nProvider } from '@store/store-i18n';
import { useUIStore } from '@/app/stores/ui.store';
import { QueryProvider } from './QueryProvider';
import { RealtimeProvider } from './RealtimeProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  //
  const locale = useUIStore((state) => state.lang);

  return (
    <StoreI18nProvider locale={locale}>
      <ThemeProvider>
        <QueryProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </QueryProvider>
      </ThemeProvider>
    </StoreI18nProvider>
  );
}

export { QueryProvider, RealtimeProvider, ThemeProvider };
