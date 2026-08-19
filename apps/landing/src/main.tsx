import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './routes';
import './styles.css';

const hasStoredStoreSession = () => {
  try {
    const accessToken = localStorage.getItem('store_access_token');
    const persistedAuth = localStorage.getItem('store-auth');

    if (!accessToken || !persistedAuth) return false;

    const auth = JSON.parse(persistedAuth) as { state?: { user?: unknown } };
    return Boolean(auth.state?.user);
  } catch {
    return false;
  }
};

if (window.location.pathname === '/' && hasStoredStoreSession()) {
  window.location.replace('/store/');
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </React.StrictMode>,
  );
}
