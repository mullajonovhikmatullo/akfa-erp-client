import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/shared/types';

export const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'store_access_token';
const AUTH_STORE_KEY = 'store-auth';
const APP_BASE_PATH = import.meta.env.BASE_URL ?? '/';
const withAppBasePath = (path: string) => {
  //
  const base = APP_BASE_PATH.replace(/\/?$/, '/');
  return `${base}${path.replace(/^\//, '')}`;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: inject JWT ────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  //
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: handle 401 ──────────────────────────────────────────────────────
// Skip the redirect for the login endpoint itself — wrong credentials should
// be handled by the form, not a full-page redirect.
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    //
    const url = error.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/me');

    if (error.response?.status === 401 && !isAuthEndpoint && tokenStore.get()) {
      tokenStore.clearAll();
      window.location.href = withAppBasePath('/auth/login?reason=expired');
    }

    return Promise.reject(error);
  },
);

// ── Token store ───────────────────────────────────────────────────────────────
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  /** Clears token + Zustand persisted user so ProtectedRoute redirects correctly */
  clearAll: () => {
    //
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
  },
};
