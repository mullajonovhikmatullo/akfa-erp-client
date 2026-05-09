/**
 * app/main.jsx — entry point.
 *
 * Migration state: AppProviders (QueryClient + Theme) wrap the legacy StoreProvider.
 * The new Zustand auth store (entities/user) runs alongside the legacy store.
 * Features are migrated incrementally — each one moves from useSel/useDispatch to
 * React Query + Zustand as the real API is wired in.
 */

import './styles.css';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import { StoreProvider } from './store.jsx';
import { AppProviders } from './providers/index.tsx';
import { AppRouter } from '../routes/index.tsx';

const App = () => (
  <AppProviders>
    <StoreProvider>
      <AppRouter />
      <Toaster richColors position="top-right" />
    </StoreProvider>
  </AppProviders>
);

const mount = () => {
  if (window.__akfa_mounted) return;
  const el = document.getElementById('root');
  if (!el) { setTimeout(mount, 30); return; }
  window.__akfa_mounted = true;
  ReactDOM.createRoot(el).render(<App />);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
