import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@store/store-stub';
import { withAppBasePath } from '@/shared/lib/app-path';

export const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'store_access_token';
const AUTH_STORE_KEY = 'store-auth';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  //
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearAll: () => {
    //
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
  },
};
