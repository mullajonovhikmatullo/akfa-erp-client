import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { RealtimeProvider } from './RealtimeProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  //
  return (
    <ThemeProvider>
      <QueryProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { QueryProvider, RealtimeProvider, ThemeProvider };
export { queryClient } from './QueryProvider';
