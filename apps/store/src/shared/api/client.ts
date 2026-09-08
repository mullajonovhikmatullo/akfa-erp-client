import { createTokenStore, http } from '@store/store-shared';

export const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
export const apiClient = http;
const sessionTokens = createTokenStore();

export const tokenStore = {
  get: sessionTokens.get,
  set: sessionTokens.set,
  clearAll: () => {
    //
    sessionTokens.clear();
    sessionStorage.removeItem('store-auth');
  },
};
